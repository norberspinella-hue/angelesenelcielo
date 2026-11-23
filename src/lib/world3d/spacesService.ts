import crypto from 'crypto';
import { PlanId, PLANS } from '@/lib/plans';
import {
  canExistingPaidMemorialClaimWorldSpace,
  isValidWorldSpaceId,
  normalizePlanId,
} from './contracts';

export const SPECIAL_PROTECTED_MEMORIAL_IDS = new Set([
  '2a755a51-b8a6-46cc-96da-965c402eb198', // Chloé
  '6dfba1cc-f7c9-446c-96d4-1d9bab3c2fc0', // Juliette
]);

export type PublicWorldSpaceStatus =
  | 'available'
  | 'reserved_pending_payment'
  | 'occupied'
  | 'review';

export interface PublicWorldSpaceItem {
  spaceId: string;
  scene: string;
  zone: string;
  supportType: string;
  displayName: string;
  planId: PlanId;
  status: PublicWorldSpaceStatus;
  occupancyStateDb: string;
  isSellable: boolean;
  isReservedAdmin: boolean;
  supportsPhoto: boolean;
  reservedUntil: string | null;
  memorial: {
    memorialId: string;
    petName: string;
    species: string;
    photoUrl: string | null;
    dedication: string;
    profileSlug: string | null;
    muralUrl: string;
    memorialUrl: string | null;
  } | null;
}

export interface WorldSpacesSummary {
  total: number;
  available: number;
  reserved_pending_payment: number;
  occupied: number;
  review: number;
  salesEnabled: boolean;
}

/**
 * Consulta la ocupación actual del inventario 3D oficial en Staging/DB.
 * Nunca devuelve PII (`email`, `stripe_session_id`, `hold_token`) ni fotos de memoriales privados/rechazados.
 */
export async function getWorldSpacesState(
  supabase: any,
  options?: {
    spaceId?: string | null;
    planId?: string | null;
    onlyNonFree?: boolean;
    webBaseUrl?: string;
  }
): Promise<{
  spaces: PublicWorldSpaceItem[];
  summary: WorldSpacesSummary;
}> {
  try {
    await supabase.rpc('release_expired_coordinated_holds');
  } catch {
    // RPC opcional en lectura
  }

  const webBaseUrl = (options?.webBaseUrl || 'https://todaslasmascotasvanalcielo.com').replace(/\/$/, '');
  const requestedSpaceId = options?.spaceId?.trim() || null;
  const requestedPlanId = options?.planId ? normalizePlanId(options.planId) : null;

  const rawSpaces: any[] = [];
  if (requestedSpaceId) {
    const { data, error } = await (supabase.from('world_spaces') as any)
      .select('space_id, scene, zone, support_type, display_name, plan_id, occupancy_state, is_sellable, is_reserved_admin, supports_photo')
      .eq('space_id', requestedSpaceId)
      .limit(1);
    if (error) throw error;
    if (Array.isArray(data)) rawSpaces.push(...data);
  } else {
    let from = 0;
    const pageSize = 1000;
    while (true) {
      let q = (supabase.from('world_spaces') as any)
        .select('space_id, scene, zone, support_type, display_name, plan_id, occupancy_state, is_sellable, is_reserved_admin, supports_photo')
        .order('space_id', { ascending: true })
        .range(from, from + pageSize - 1);
      if (requestedPlanId) {
        q = q.eq('plan_id', requestedPlanId);
      }
      const { data, error } = await q;
      if (error) throw error;
      if (!data || data.length === 0) break;
      rawSpaces.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
  }

  let allocQuery = (supabase.from('world_space_allocations') as any)
    .select('space_id, memorial_id, status, expires_at')
    .in('status', ['reserved_pending_payment', 'occupied']);

  if (requestedSpaceId) {
    allocQuery = allocQuery.eq('space_id', requestedSpaceId);
  }

  const { data: activeAllocs, error: allocError } = await allocQuery;
  if (allocError) throw allocError;

  const nowMs = Date.now();
  const occupiedBySpace = new Map<string, { memorialId: string | null }>();
  const holdBySpace = new Map<string, { expiresAt: string | null }>();
  const occupiedMemorialIds = new Set<string>();

  for (const alloc of activeAllocs || []) {
    if (!alloc.space_id) continue;
    if (alloc.status === 'occupied') {
      occupiedBySpace.set(alloc.space_id, { memorialId: alloc.memorial_id || null });
      if (alloc.memorial_id) occupiedMemorialIds.add(alloc.memorial_id);
    } else if (alloc.status === 'reserved_pending_payment') {
      const exp = alloc.expires_at ? Date.parse(alloc.expires_at) : NaN;
      if (Number.isNaN(exp) || exp > nowMs) {
        holdBySpace.set(alloc.space_id, { expiresAt: alloc.expires_at || null });
      }
    }
  }

  const memorialMap = new Map<string, PublicWorldSpaceItem['memorial']>();
  if (occupiedMemorialIds.size > 0) {
    const { data: memRows } = await (supabase.from('memorials') as any)
      .select('id, pet_name, species, photo_url, dedication, profile_slug, slot_assigned, visibility, publication_status, moderation_status')
      .in('id', Array.from(occupiedMemorialIds));

    for (const row of memRows || []) {
      const isPublicVisible =
        row.visibility === 'public' &&
        row.publication_status === 'published' &&
        row.moderation_status !== 'rejected';
      if (!isPublicVisible) continue;

      const hasCoords = typeof row.slot_assigned === 'string' && row.slot_assigned.includes(',');
      const muralUrl = hasCoords
        ? `${webBaseUrl}/mural-global?highlight=${encodeURIComponent(row.slot_assigned.trim())}&zoom=true`
        : `${webBaseUrl}/mural-global?memorialId=${row.id}`;
      const memorialUrl = row.profile_slug ? `${webBaseUrl}/memorial/${row.profile_slug}` : null;

      memorialMap.set(row.id, {
        memorialId: row.id,
        petName: row.pet_name || 'Ángel',
        species: row.species || 'otro',
        photoUrl: typeof row.photo_url === 'string' && row.photo_url.trim() ? row.photo_url.trim() : null,
        dedication: row.dedication || '',
        profileSlug: row.profile_slug || null,
        muralUrl,
        memorialUrl,
      });
    }
  }

  const summary: WorldSpacesSummary = {
    total: 0,
    available: 0,
    reserved_pending_payment: 0,
    occupied: 0,
    review: 0,
    salesEnabled: false,
  };

  let anySellable = false;
  const allSpaces: PublicWorldSpaceItem[] = [];

  for (const row of rawSpaces) {
    const planId = normalizePlanId(row.plan_id) || 'huellita';
    const occ = occupiedBySpace.get(row.space_id);
    const hold = holdBySpace.get(row.space_id);

    let status: PublicWorldSpaceStatus = 'available';
    if (occ || row.occupancy_state === 'occupied') {
      status = 'occupied';
    } else if (hold) {
      status = 'reserved_pending_payment';
    } else if (row.is_reserved_admin || row.occupancy_state !== 'free') {
      status = 'review';
    }

    if (row.is_sellable) anySellable = true;
    summary.total += 1;
    summary[status] += 1;

    if (options?.onlyNonFree && status === 'available') {
      continue;
    }

    allSpaces.push({
      spaceId: row.space_id,
      scene: row.scene || 'exterior',
      zone: row.zone || '',
      supportType: row.support_type || '',
      displayName: row.display_name || row.space_id,
      planId,
      status,
      occupancyStateDb: row.occupancy_state || 'free',
      isSellable: Boolean(row.is_sellable),
      isReservedAdmin: Boolean(row.is_reserved_admin),
      supportsPhoto: Boolean(row.supports_photo),
      reservedUntil: status === 'reserved_pending_payment' ? (hold?.expiresAt || null) : null,
      memorial: status === 'occupied' && occ?.memorialId ? memorialMap.get(occ.memorialId) || null : null,
    });
  }

  summary.salesEnabled = anySellable && process.env.WORLD3D_SALES_ENABLED === 'true';

  return { spaces: allSpaces, summary };
}

export async function acquireWorldHold(
  supabase: any,
  params: {
    spaceId: string;
    planId: string;
    startX: number;
    startY: number;
    holdToken?: string;
    ttlMinutes?: number;
  }
): Promise<{
  ok: boolean;
  status: number;
  reason: string;
  allocationId: string | null;
  holdToken: string | null;
  expiresAt: string | null;
}> {
  if (!isValidWorldSpaceId(params.spaceId)) {
    return {
      ok: false,
      status: 400,
      reason: 'INVALID_SPACE_ID',
      allocationId: null,
      holdToken: null,
      expiresAt: null,
    };
  }

  const canonicalPlan = normalizePlanId(params.planId);
  if (!canonicalPlan) {
    return {
      ok: false,
      status: 400,
      reason: 'INVALID_PLAN',
      allocationId: null,
      holdToken: null,
      expiresAt: null,
    };
  }

  const blockSize = PLANS[canonicalPlan].size;
  if (
    !Number.isInteger(params.startX) ||
    !Number.isInteger(params.startY) ||
    params.startX < 0 ||
    params.startY < 0 ||
    params.startX + blockSize > 1000 ||
    params.startY + blockSize > 1000
  ) {
    return {
      ok: false,
      status: 400,
      reason: 'INVALID_MURAL_COORDS',
      allocationId: null,
      holdToken: null,
      expiresAt: null,
    };
  }

  const holdToken =
    typeof params.holdToken === 'string' && params.holdToken.trim().length >= 8
      ? params.holdToken.trim()
      : crypto.randomUUID();

  const { data, error } = await supabase.rpc('acquire_coordinated_hold', {
    p_space_id: params.spaceId.trim(),
    p_plan_id: canonicalPlan,
    p_start_x: params.startX,
    p_start_y: params.startY,
    p_block_size: blockSize,
    p_hold_token: holdToken,
    p_ttl_minutes: params.ttlMinutes ?? 20,
  });

  if (error) {
    console.error('Error RPC acquire_coordinated_hold:', error);
    return {
      ok: false,
      status: 500,
      reason: 'HOLD_RPC_ERROR',
      allocationId: null,
      holdToken: null,
      expiresAt: null,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !row.acquired) {
    const reason = row?.reason || 'WORLD_SPACE_UNAVAILABLE';
    const status = reason === 'WORLD_SPACE_NOT_FOUND' ? 404 : reason === 'PLAN_MISMATCH' ? 400 : 409;
    return {
      ok: false,
      status,
      reason,
      allocationId: null,
      holdToken: null,
      expiresAt: null,
    };
  }

  return {
    ok: true,
    status: 200,
    reason: 'OK',
    allocationId: row.allocation_id || null,
    holdToken,
    expiresAt: row.expires_at || null,
  };
}

export async function releaseWorldHold(supabase: any, holdToken: string): Promise<boolean> {
  if (!holdToken || typeof holdToken !== 'string') return false;
  const { data, error } = await supabase.rpc('release_coordinated_hold', {
    p_hold_token: holdToken.trim(),
  });
  if (error) {
    console.error('Error RPC release_coordinated_hold:', error);
    return false;
  }
  return Boolean(data);
}

export function hashClaimToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

export interface ClaimRequestOutcome {
  spaceExists: boolean;
  spaceFree: boolean;
  issued: boolean;
  internalReason: string;
  rawToken?: string;
  petName?: string;
  spaceDisplayName?: string;
  normalizedEmail?: string;
}

/**
 * Evalúa si un correo tiene un memorial pagado elegible para ocupar `spaceId`
 * (nunca Cartas al Cielo gratis, nunca Chloé/Juliette, nunca 2.ª plaza 3D, mismo plan).
 * Si es elegible, emite token opaco hashed SHA-256 en `world_3d_claim_tokens` (TTL 15 min).
 */
export async function prepareWorld3DClaimToken(
  supabase: any,
  params: { spaceId: string; email: string }
): Promise<ClaimRequestOutcome> {
  const spaceId = params.spaceId.trim();
  const normalizedEmail = params.email.trim().toLowerCase();

  const { data: spaceRow } = await (supabase.from('world_spaces') as any)
    .select('space_id, display_name, plan_id, occupancy_state, is_reserved_admin')
    .eq('space_id', spaceId)
    .maybeSingle();

  if (!spaceRow) {
    return { spaceExists: false, spaceFree: false, issued: false, internalReason: 'WORLD_SPACE_NOT_FOUND' };
  }

  if (spaceRow.is_reserved_admin || spaceRow.occupancy_state !== 'free') {
    return {
      spaceExists: true,
      spaceFree: false,
      issued: false,
      internalReason: 'SPACE_NOT_FREE',
    };
  }

  const { data: existingHoldOrOcc } = await (supabase.from('world_space_allocations') as any)
    .select('id, status, expires_at')
    .eq('space_id', spaceId)
    .in('status', ['reserved_pending_payment', 'occupied'])
    .limit(5);

  const nowMs = Date.now();
  const hasBlockingAlloc = (existingHoldOrOcc || []).some((a: any) => {
    if (a.status === 'occupied') return true;
    const exp = a.expires_at ? Date.parse(a.expires_at) : NaN;
    return Number.isNaN(exp) || exp > nowMs;
  });

  if (hasBlockingAlloc) {
    return {
      spaceExists: true,
      spaceFree: false,
      issued: false,
      internalReason: 'SPACE_OCCUPIED_OR_HELD',
    };
  }

  const targetPlan = normalizePlanId(spaceRow.plan_id);
  if (!targetPlan) {
    return { spaceExists: true, spaceFree: true, issued: false, internalReason: 'INVALID_SPACE_PLAN' };
  }

  const { data: memRows } = await (supabase.from('memorials') as any)
    .select('id, pet_name, email, payment_status, publication_status, moderation_status, plan_type, expires_at, story_answers, created_at')
    .ilike('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!memRows || memRows.length === 0) {
    return { spaceExists: true, spaceFree: true, issued: false, internalReason: 'NO_MEMORIAL_FOR_EMAIL' };
  }

  const candidateIds = memRows.map((m: any) => m.id);
  const { data: alreadyAllocatedRows } = await (supabase.from('world_space_allocations') as any)
    .select('memorial_id, space_id, status')
    .in('memorial_id', candidateIds)
    .eq('status', 'occupied');

  const allocByMemorial = new Map<string, string>();
  for (const a of alreadyAllocatedRows || []) {
    allocByMemorial.set(a.memorial_id, a.space_id);
  }

  let eligibleMemorial: any = null;
  let lastReason = 'NO_ELIGIBLE_MEMORIAL';

  for (const m of memRows) {
    if (SPECIAL_PROTECTED_MEMORIAL_IDS.has(m.id)) {
      lastReason = 'SPECIAL_MEMORIAL_PROTECTED';
      continue;
    }
    if (m.story_answers?.isCommunity === true) {
      lastReason = 'COMMUNITY_FREE_NO_3D_RIGHT';
      continue;
    }
    const check = canExistingPaidMemorialClaimWorldSpace(
      m,
      targetPlan,
      allocByMemorial.get(m.id) || null,
      nowMs
    );
    if (check.allowed) {
      eligibleMemorial = m;
      break;
    }
    lastReason = check.reason;
  }

  if (!eligibleMemorial) {
    return {
      spaceExists: true,
      spaceFree: true,
      issued: false,
      internalReason: lastReason,
    };
  }

  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashClaimToken(rawToken);
  const expiresAt = new Date(nowMs + 15 * 60 * 1000).toISOString();

  const { error: insertErr } = await (supabase.from('world_3d_claim_tokens') as any).insert({
    memorial_id: eligibleMemorial.id,
    space_id: spaceId,
    token_hash: tokenHash,
    requested_email: normalizedEmail,
    expires_at: expiresAt,
  });

  if (insertErr) {
    console.error('Error insert world_3d_claim_tokens:', insertErr);
    return { spaceExists: true, spaceFree: true, issued: false, internalReason: 'TOKEN_INSERT_ERROR' };
  }

  return {
    spaceExists: true,
    spaceFree: true,
    issued: true,
    internalReason: 'OK',
    rawToken,
    petName: eligibleMemorial.pet_name || 'tu angelito',
    spaceDisplayName: spaceRow.display_name || spaceId,
    normalizedEmail,
  };
}
