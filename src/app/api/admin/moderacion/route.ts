import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';
import {
  getAdminCommunityModerationData,
  getAdminLegacyGuardianClaims,
  moderateCommunityEntity,
  reviewLegacyGuardianClaim,
} from '@/lib/community/tributesDb';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';

export const dynamic = 'force-dynamic';

function verifyAdminModeracionAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const customHeader = req.headers.get('x-admin-moderacion-key')?.trim() || '';
  const candidate = bearer || customHeader;
  if (!candidate) return false;

  const configuredSecrets = [
    process.env.ADMIN_MODERACION_PIN,
    process.env.ADMIN_SECRET,
    process.env.ADMIN_API_KEY,
    ...(process.env.NODE_ENV !== 'production' ? ['cielo2026', 'angeles2026'] : []),
  ].filter((s): s is string => Boolean(s && s.trim()));

  for (const secret of configuredSecrets) {
    const a = Buffer.from(candidate);
    const b = Buffer.from(secret.trim());
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return true;
    }
  }
  return false;
}

// GET: Listar memoriales (y opcionalmente homenajes/cartas multicarta) con filtros, búsqueda y paginación
export async function GET(req: NextRequest) {
  try {
    if (!verifyAdminModeracionAuth(req)) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'memorials';
    const search = searchParams.get('search')?.trim() || '';
    const filter = searchParams.get('filter') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25', 10)));

    if (scope === 'multicarta') {
      if (!verifyAdminModeracionAuth(req)) {
        return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
      }
      const [data, claims] = await Promise.all([
        getAdminCommunityModerationData({
          statusFilter: filter,
          search,
          limit,
        }),
        getAdminLegacyGuardianClaims(filter),
      ]);
      return NextResponse.json({ success: true, scope: 'multicarta', ...data, claims });
    }

    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('memorials')
      .select('id, pet_name, species, breed, email, location, dedication, photo_url, plan_type, price_paid, visibility, moderation_status, slot_assigned, profile_slug, story_answers, created_at', { count: 'exact' });

    // Filtros
    if (filter === 'public') {
      query = query.eq('visibility', 'public').neq('moderation_status', 'rejected');
    } else if (filter === 'hidden') {
      query = query.or('visibility.eq.private,moderation_status.eq.rejected');
    }

    // Búsqueda por nombre de mascota o email
    if (search) {
      query = query.or(`pet_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Orden por más reciente
    query = query.order('created_at', { ascending: false });

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data: memorials, count, error } = await (query as any);

    if (error) {
      console.error('Error en GET /api/admin/moderacion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filtrado en memoria para protectoras vs particulares si aplica
    let filteredMemorials = memorials || [];
    if (filter === 'shelter') {
      filteredMemorials = filteredMemorials.filter((m: any) => 
        m.story_answers?.isShelter === true || Boolean(m.story_answers?.shelterName)
      );
    } else if (filter === 'standard') {
      filteredMemorials = filteredMemorials.filter((m: any) => 
        !m.story_answers?.isShelter && !m.story_answers?.shelterName
      );
    }

    // Estadísticas globales rápidas
    const { data: allStats } = await (supabase
      .from('memorials') as any)
      .select('visibility, moderation_status, story_answers');

    const totalCount = allStats?.length || 0;
    const publicCount = (allStats || []).filter((m: any) => m.visibility === 'public' && m.moderation_status !== 'rejected').length;
    const hiddenCount = (allStats || []).filter((m: any) => m.visibility === 'private' || m.moderation_status === 'rejected').length;
    const shelterCount = (allStats || []).filter((m: any) => m.story_answers?.isShelter || m.story_answers?.shelterName).length;

    return NextResponse.json({
      success: true,
      memorials: filteredMemorials,
      total: count || totalCount,
      page,
      limit,
      totalPages: Math.ceil((count || totalCount) / limit),
      stats: {
        totalCount,
        publicCount,
        hiddenCount,
        shelterCount,
      },
    });
  } catch (error: any) {
    console.error('Error no controlado en /api/admin/moderacion:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

const PUBLIC_PHOTO_BUCKET = 'pet-photos';
const QUARANTINE_PHOTO_BUCKET = 'pet-photos-quarantine';

function extractPetPhotoStoragePath(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    const parsed = new URL(rawUrl.trim());
    const marker = `/storage/v1/object/public/${PUBLIC_PHOTO_BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    const objectPath = decodeURIComponent(parsed.pathname.slice(idx + marker.length)).replace(/^\/+/, '');
    if (!objectPath || objectPath.includes('..')) return null;
    return objectPath;
  } catch {
    return null;
  }
}

function buildMatchingThumbnailPath(objectPath: string): string | null {
  const m = /^pets\/original\/([0-9]+)\.[^/]+$/i.exec(objectPath);
  return m ? `pets/thumbnails/${m[1]}.webp` : null;
}

async function ensureQuarantineBucket(supabase: any): Promise<void> {
  try {
    const { data } = await supabase.storage.getBucket(QUARANTINE_PHOTO_BUCKET);
    if (!data) {
      await supabase.storage.createBucket(QUARANTINE_PHOTO_BUCKET, { public: false });
    }
  } catch {
    await supabase.storage.createBucket(QUARANTINE_PHOTO_BUCKET, { public: false }).catch(() => {});
  }
}

async function transferBetweenBuckets(
  supabase: any,
  fromBucket: string,
  toBucket: string,
  objectPaths: string[],
  deleteSource: boolean
): Promise<string[]> {
  const moved: string[] = [];
  for (const path of objectPaths) {
    try {
      const { data: blob, error: dlErr } = await supabase.storage.from(fromBucket).download(path);
      if (!dlErr && blob) {
        const contentType = path.endsWith('.webp') ? 'image/webp' : path.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const arrayBuf = await blob.arrayBuffer();
        const { error: upErr } = await supabase.storage
          .from(toBucket)
          .upload(path, Buffer.from(arrayBuf), { contentType, upsert: true });
        if (!upErr && deleteSource) {
          await supabase.storage.from(fromBucket).remove([path]);
          moved.push(path);
        }
      }
    } catch {}
  }
  return moved;
}

async function purgeWorld3DPortraitCache(photoUrls: string[]): Promise<{ attempted: boolean; ok: boolean; status?: number }> {
  const world3dOrigin = (process.env.WORLD3D_REWRITE_ORIGIN || '').trim().replace(/\/$/, '');
  const gatewaySecret = (process.env.WORLD3D_GATEWAY_SECRET || '').trim();
  const bypassSecret = (process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '').trim();
  const cleanUrls = photoUrls.filter((u) => typeof u === 'string' && u.trim().length > 0);
  if (!world3dOrigin || !gatewaySecret || cleanUrls.length === 0) {
    return { attempted: false, ok: false };
  }
  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-world3d-gateway-secret': gatewaySecret,
    };
    if (bypassSecret) headers['x-vercel-protection-bypass'] = bypassSecret;
    const res = await fetch(`${world3dOrigin}/cielo3d/retrato/purge`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ photoUrls: cleanUrls }),
      signal: AbortSignal.timeout(5000),
    });
    return { attempted: true, ok: res.ok, status: res.status };
  } catch {
    return { attempted: true, ok: false };
  }
}

// PATCH: Actualizar visibilidad, estado de moderación o dedicatoria (memorials o multicarta)
export async function PATCH(req: NextRequest) {
  try {
    const csrfErrorGlobal = verifyCsrfOrigin(req);
    if (csrfErrorGlobal) return csrfErrorGlobal;
    if (!verifyAdminModeracionAuth(req)) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
    }

    const body = await req.json();

    if (body?.entityType === 'tribute' || body?.entityType === 'tribute_letter') {
      const csrfError = verifyCsrfOrigin(req);
      if (csrfError) return csrfError;
      if (!verifyAdminModeracionAuth(req)) {
        return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
      }
      const { entityType, id, action } = body;
      if (!id || !['approve', 'pending', 'reject', 'archive', 'soft_delete', 'restore'].includes(action)) {
        return NextResponse.json({ error: 'Parámetros de moderación multicarta inválidos' }, { status: 400 });
      }
      const updated = await moderateCommunityEntity({ entityType, id, action });
      if (!updated) {
        return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, entityType, id, action });
    }

    if (body?.entityType === 'guardian_claim') {
      const csrfError = verifyCsrfOrigin(req);
      if (csrfError) return csrfError;
      if (!verifyAdminModeracionAuth(req)) {
        return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
      }
      const { id, action, decisionReason } = body;
      if (!id || !['approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Acción de custodia inválida' }, { status: 400 });
      }
      const reviewRes = await reviewLegacyGuardianClaim({
        claimId: id,
        decision: action,
        decisionReason: typeof decisionReason === 'string' ? decisionReason : '',
        reviewedBy: 'admin_moderacion',
      });
      if (!reviewRes.ok) {
        return NextResponse.json({ error: reviewRes.error }, { status: reviewRes.status });
      }
      return NextResponse.json({ success: true, entityType: 'guardian_claim', id, ...reviewRes });
    }

    const supabase = createAdminClient();
    const { id, visibility, moderation_status, dedication, pet_name, socialHandle, removePhoto } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID del memorial es obligatorio' }, { status: 400 });
    }

    const { data: existingMemorial } = await (supabase
      .from('memorials') as any)
      .select('id, photo_url, visibility, moderation_status, story_answers')
      .eq('id', id)
      .maybeSingle();

    // Mapear visibilidad al enum de postgres: 'public' o 'private'
    let dbVisibility: 'public' | 'private' | undefined = undefined;
    if (visibility !== undefined) {
      dbVisibility = (visibility === 'hidden' || visibility === 'private') ? 'private' : 'public';
    }

    // Mapear estado de moderación acorde
    let dbModeration = moderation_status;
    if (dbVisibility === 'private' && !moderation_status) {
      dbModeration = 'rejected';
    } else if (dbVisibility === 'public' && !moderation_status) {
      dbModeration = 'approved';
    }

    const updatePayload: any = {};
    if (dbVisibility !== undefined) updatePayload.visibility = dbVisibility;
    if (dbModeration !== undefined) updatePayload.moderation_status = dbModeration;
    if (dedication !== undefined) updatePayload.dedication = dedication;
    if (pet_name !== undefined) updatePayload.pet_name = pet_name;
    if (removePhoto === true) updatePayload.photo_url = '';

    if (socialHandle !== undefined) {
      const currentStoryAnswers = existingMemorial?.story_answers || {};
      updatePayload.story_answers = {
        ...currentStoryAnswers,
        socialHandle: socialHandle ? socialHandle.replace(/^@/, '').trim() : '',
      };
    }

    // 1. Actualizar la tabla memorials
    const { data: updated, error } = await (supabase
      .from('memorials') as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar memorial en moderación:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Si cambia la visibilidad o se retira foto, sincronizar slots y retirar archivo público de Storage + caché CDN
    if (dbVisibility !== undefined) {
      const slotStatus = dbVisibility === 'private' ? 'blocked_admin' : 'occupied';
      const slotPatch: Record<string, any> = { status: slotStatus };
      if (removePhoto === true) slotPatch.thumbnail_url = '';
      const { error: slotErr } = await (supabase
        .from('mural_slots') as any)
        .update(slotPatch)
        .eq('memorial_id', id);

      if (slotErr) {
        console.error('Error al sincronizar mural_slots en moderación:', slotErr);
      }
    } else if (removePhoto === true) {
      await (supabase.from('mural_slots') as any).update({ thumbnail_url: '' }).eq('memorial_id', id);
    }

    const existingPhotoUrl = existingMemorial?.photo_url || '';
    const photoPath = extractPetPhotoStoragePath(existingPhotoUrl);
    const candidatePaths = photoPath
      ? Array.from(new Set([photoPath, buildMatchingThumbnailPath(photoPath)].filter((p): p is string => Boolean(p))))
      : [];

    let storageAction: string = 'none';
    let cachePurge: { attempted: boolean; ok: boolean; status?: number } = { attempted: false, ok: false };

    const shouldRetireFromPublicStorage =
      removePhoto === true || dbVisibility === 'private' || dbModeration === 'rejected';

    if (shouldRetireFromPublicStorage) {
      if (candidatePaths.length > 0) {
        if (removePhoto === true) {
          await supabase.storage.from(PUBLIC_PHOTO_BUCKET).remove(candidatePaths).catch(() => {});
          await supabase.storage.from(QUARANTINE_PHOTO_BUCKET).remove(candidatePaths).catch(() => {});
          storageAction = 'deleted_permanently';
        } else {
          await ensureQuarantineBucket(supabase);
          const moved = await transferBetweenBuckets(
            supabase,
            PUBLIC_PHOTO_BUCKET,
            QUARANTINE_PHOTO_BUCKET,
            candidatePaths,
            true
          );
          storageAction = moved.length > 0 ? 'quarantined_private' : 'already_absent';
        }
      }
      if (existingPhotoUrl) {
        cachePurge = await purgeWorld3DPortraitCache([existingPhotoUrl]);
      }
    } else if (dbVisibility === 'public' && dbModeration !== 'rejected' && candidatePaths.length > 0) {
      await transferBetweenBuckets(
        supabase,
        QUARANTINE_PHOTO_BUCKET,
        PUBLIC_PHOTO_BUCKET,
        candidatePaths,
        true
      );
      storageAction = 'restored_from_quarantine';
    }

    return NextResponse.json({
      success: true,
      message: 'Memorial actualizado con éxito',
      memorial: updated,
      storageAction,
      cachePurge,
    });
  } catch (error: any) {
    console.error('Error no controlado en PATCH /api/admin/moderacion:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
