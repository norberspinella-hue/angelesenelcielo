import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { world3dCorsHeaders } from '@/lib/world3d/cors';
import { getWorldSpacesState } from '@/lib/world3d/spacesService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: world3dCorsHeaders(req) });
}

/**
 * Devuelve el inventario/estado de ocupación 3D en Staging/DB.
 * Parámetros opcionales:
 * - ?space_id=<id> : ficha individual de un espacio
 * - ?plan=<planId> : filtra por plan comercial
 * - ?onlyNonFree=1 : devuelve únicamente plazas ocupadas, en hold o en revisión (payload compacto)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get('space_id');
    const planId = searchParams.get('plan');
    const onlyNonFree = searchParams.get('onlyNonFree') === '1';

    const state = await getWorldSpacesState(supabase, {
      spaceId,
      planId,
      onlyNonFree,
      webBaseUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://todaslasmascotasvanalcielo.com',
    });

    if (spaceId && state.spaces.length === 0) {
      return NextResponse.json(
        { success: false, error: 'WORLD_SPACE_NOT_FOUND', summary: state.summary },
        { status: 404, headers: world3dCorsHeaders(req) }
      );
    }

    return NextResponse.json(
      {
        success: true,
        capturedAt: new Date().toISOString(),
        summary: state.summary,
        count: state.spaces.length,
        space: spaceId ? state.spaces[0] : undefined,
        spaces: state.spaces,
      },
      { headers: world3dCorsHeaders(req) }
    );
  } catch (err: any) {
    console.error('Error en GET /api/world-3d/spaces:', err);
    return NextResponse.json(
      { success: false, error: 'Error al consultar espacios 3D.' },
      { status: 500, headers: world3dCorsHeaders(req) }
    );
  }
}
