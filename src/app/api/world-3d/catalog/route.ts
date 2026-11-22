import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { buildPublic3DMuralCatalog, CatalogMemorial3DItem, RawMemorialCatalogRow, WorldAllocationLookup } from '@/lib/world3d/catalogService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_ORIGINS = new Set([
  'https://todaslasmascotasvanalcielo.com',
  'https://www.todaslasmascotasvanalcielo.com',
  'https://cielo-jardin-de-los-recuerdos.norber-spinella.chatgpt.site',
  'http://localhost:3000',
  'http://127.0.0.1:8787',
]);

function corsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://cielo-jardin-de-los-recuerdos.norber-spinella.chatgpt.site';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function toLegacyGardenMemory(item: CatalogMemorial3DItem, activeCandleId: string | undefined) {
  return {
    id: item.memorialId,
    name: item.petName,
    message: item.dedication,
    photo: item.photoUrl,
    lit: item.hasActiveCandle,
    species: item.species,
    shelter: item.catalogKind === 'shelter',
    heart: item.isFounder,
    story: item.memorialUrl || item.muralUrl,
    muralUrl: item.muralUrl,
    ...(activeCandleId ? { light: `https://todaslasmascotasvanalcielo.com/cielo-lleno-de-luces?candleId=${activeCandleId}` } : {}),
    ...(item.worldSpaceId ? { spaceId: item.worldSpaceId } : {}),
    planId: item.planId,
    muralSlotsCount: item.muralSlotsCount,
    hasActiveCandle: item.hasActiveCandle,
  };
}

/**
 * Catálogo público del Mundo 3D independiente de `altar_candles`.
 * Devuelve todos los memoriales públicos elegibles directamente desde `public.memorials`
 * (incluyendo mascotas pagadas que aún no tienen vela activa, como Dino, Rocky, Sting, Sai o Kazan).
 * Estrictamente whitelistado: nunca expone emails, tokens ni datos de pago.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const includeCommunityFree = searchParams.get('includeCommunity') === '1';
    const memorialIdFilter = searchParams.get('memorialId')?.trim() || null;

    let query = (supabase.from('memorials') as any)
      .select('id, pet_name, species, breed, photo_url, dedication, birth_date, death_date, plan_type, slots_count, payment_status, publication_status, visibility, moderation_status, profile_slug, slot_assigned, expires_at, story_answers, created_at')
      .eq('visibility', 'public')
      .eq('publication_status', 'published')
      .neq('moderation_status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(includeCommunityFree ? 500 : 300);

    if (memorialIdFilter) {
      query = query.eq('id', memorialIdFilter);
    }

    const { data: memorialRows, error: memError } = await query;
    if (memError) {
      console.error('Error querying memorials for world-3d catalog:', memError);
      return NextResponse.json({ success: false, error: 'Catalog query failed' }, { status: 500, headers: corsHeaders(req) });
    }

    // Lectura opcional de velas para enriquecer estado `lit`, nunca como filtro excluyente
    const activeCandleByMemorial = new Map<string, string>();
    try {
      const { data: candles } = await (supabase.from('altar_candles') as any)
        .select('id, memorial_id, status')
        .eq('status', 'active')
        .not('memorial_id', 'is', null);
      for (const c of candles || []) {
        if (c.memorial_id && !activeCandleByMemorial.has(c.memorial_id)) {
          activeCandleByMemorial.set(c.memorial_id, c.id);
        }
      }
    } catch {
      // Si fallara lectura de velas, el catálogo público sigue operando con normalidad
    }

    // Lectura opcional de world_space_allocations (tolerante si migración 0017 no se ha ejecutado aún)
    let allocations: WorldAllocationLookup[] = [];
    try {
      const { data: allocRows, error: allocErr } = await (supabase.from('world_space_allocations') as any)
        .select('memorial_id, space_id, status')
        .eq('status', 'occupied');
      if (!allocErr && Array.isArray(allocRows)) {
        allocations = allocRows;
      }
    } catch {
      // Tabla pendiente de migración 0017
    }

    const items = buildPublic3DMuralCatalog((memorialRows || []) as RawMemorialCatalogRow[], {
      includeCommunityFree,
      allocations,
      activeCandleMemorialIds: new Set(activeCandleByMemorial.keys()),
      webBaseUrl: process.env.NEXT_PUBLIC_URL || 'https://todaslasmascotasvanalcielo.com',
    });

    const memories = items.map((item) => toLegacyGardenMemory(item, activeCandleByMemorial.get(item.memorialId)));

    return NextResponse.json(
      {
        success: true,
        source: 'memorials_direct',
        candleDependent: false,
        count: items.length,
        capturedAt: new Date().toISOString(),
        items,
        memories,
      },
      { headers: corsHeaders(req) }
    );
  } catch (err: any) {
    console.error('Unexpected error in /api/world-3d/catalog:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500, headers: corsHeaders(req) });
  }
}
