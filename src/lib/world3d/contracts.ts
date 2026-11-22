import { PLANS, PlanId, getPlan, getPlanByDbName } from '@/lib/plans';

/**
 * Distribución comercial aprobada Mundo 3D <-> Mural Global.
 * NO contiene IDs definitivos de Work: sirve de contrato estructural hasta
 * recibir el maestro y catálogo definitivo de `space_id`.
 */
export interface WorldZoneAllocationRule {
  planId: PlanId;
  muralSize: number;
  muralSlotsCount: number;
  approvedWorldZones: string[];
  forestIncludedNoSupplement: boolean;
  requiresFounderZoneInMural: boolean;
}

export const WORLD_3D_PLAN_DISTRIBUTION: Record<PlanId, WorldZoneAllocationRule> = {
  huellita: {
    planId: 'huellita',
    muralSize: PLANS.huellita.size,
    muralSlotsCount: PLANS.huellita.slotsCount, // 1
    approvedWorldZones: ['Murales exteriores generales (nichos)'],
    forestIncludedNoSupplement: false,
    requiresFounderZoneInMural: false,
  },
  estrella_brillante: {
    planId: 'estrella_brillante',
    muralSize: PLANS.estrella_brillante.size,
    muralSlotsCount: PLANS.estrella_brillante.slotsCount, // 4
    approvedWorldZones: [
      'Bosque de los Angelitos (32 árboles, sin suplemento)',
      'Tren de los Reencuentros (cuadros pequeños)',
      'Casita de Algodón - Salón (12 cuadros)',
    ],
    forestIncludedNoSupplement: true,
    requiresFounderZoneInMural: false,
  },
  corazon_eterno: {
    planId: 'corazon_eterno',
    muralSize: PLANS.corazon_eterno.size,
    muralSlotsCount: PLANS.corazon_eterno.slotsCount, // 9
    approvedWorldZones: [
      'Lago de los Cisnes (16 altares)',
      'Jardín de Juegos (48 altares)',
      'Castillo de los Recuerdos - Alas (52 cuadros x1)',
    ],
    forestIncludedNoSupplement: false,
    requiresFounderZoneInMural: true,
  },
  angelito_protector: {
    planId: 'angelito_protector',
    muralSize: PLANS.angelito_protector.size,
    muralSlotsCount: PLANS.angelito_protector.slotsCount, // 16
    approvedWorldZones: [
      'Castillo de los Recuerdos (20 cuadros x2)',
      'Casita de Algodón - Perímetro (68 grandes cuadros)',
    ],
    forestIncludedNoSupplement: false,
    requiresFounderZoneInMural: false,
  },
  galaxia_amor: {
    planId: 'galaxia_amor',
    muralSize: PLANS.galaxia_amor.size,
    muralSlotsCount: PLANS.galaxia_amor.slotsCount, // 25
    approvedWorldZones: [
      'Castillo de los Recuerdos (nuevos cuadros 5x5)',
      'Futuros grandes altares exteriores',
    ],
    forestIncludedNoSupplement: false,
    requiresFounderZoneInMural: false,
  },
  vinculo_infinito: {
    planId: 'vinculo_infinito',
    muralSize: PLANS.vinculo_infinito.size,
    muralSlotsCount: PLANS.vinculo_infinito.slotsCount, // 36
    approvedWorldZones: [
      'Castillo de los Recuerdos (8 cuadros x3 existentes)',
      'Castillo de los Recuerdos - Salón Central (nuevos cuadros monumentales)',
    ],
    forestIncludedNoSupplement: false,
    requiresFounderZoneInMural: false,
  },
};

/** Contrato agnóstico de un espacio 3D que entregará Work. */
export interface WorldSpaceDescriptor {
  spaceId: string;
  zone: string;
  supportType: string;
  displayName: string;
  planId: PlanId;
  isSellable: boolean;
  isReservedAdmin: boolean;
  supportsPhoto: boolean;
  coords?: { x: number; y: number; z: number; yaw?: number };
  camera?: { x: number; y: number; z: number; lookAtX: number; lookAtY: number; lookAtZ: number };
  catalogVersion: string;
}

/** Estado de ocupación de un espacio 3D devuelto al cliente. */
export type WorldSpaceOccupancyStatus =
  | 'available'
  | 'reserved_pending_payment'
  | 'occupied'
  | 'reserved_admin';

/** Parámetros de entrada desde Mundo 3D hacia `/mural-global`. */
export interface Mural3DHandshakeParams {
  spaceId: string;
  planId: PlanId;
  source: 'cielo3d';
  returnTo?: string;
  existingMemorialId?: string;
}

/** Metadatos adicionales (compatibles con límite <=500 chars de Stripe) en Checkout. */
export interface CoordinatedStripeMetadata {
  worldSpaceId?: string;
  worldReservationId?: string;
  worldHoldToken?: string;
  integrationSource?: 'mural_only' | 'cielo3d_to_mural' | 'mural_to_cielo3d';
  claimExistingMemorialId?: string;
}

/** Valida que un `space_id` externo tenga formato seguro y agnóstico antes de guardar/consultar. */
export function isValidWorldSpaceId(spaceId: string | null | undefined): boolean {
  if (!spaceId || typeof spaceId !== 'string') return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,95}$/.test(spaceId.trim());
}

/** Resuelve un parámetro `plan` o `dbName` al PlanId canónico. */
export function normalizePlanId(planOrDbName: string | null | undefined): PlanId | null {
  if (!planOrDbName) return null;
  const byPublic = getPlan(planOrDbName);
  if (byPublic) return byPublic.id;
  const byDb = getPlanByDbName(planOrDbName);
  return byDb ? byDb.id : null;
}

/** Construye la URL de entrada desde el Mundo 3D al Mural Global conservando `space_id` y `plan`. */
export function buildMuralSelectionUrlFrom3D(
  baseUrl: string,
  params: { spaceId: string; planId: PlanId; existingMemorialId?: string; returnTo?: string }
): string {
  const url = new URL('/mural-global', baseUrl);
  url.searchParams.set('space_id', params.spaceId);
  url.searchParams.set('plan', params.planId);
  url.searchParams.set('source', 'cielo3d');
  if (params.existingMemorialId) {
    url.searchParams.set('memorial_id', params.existingMemorialId);
  }
  if (params.returnTo) {
    url.searchParams.set('return_to', params.returnTo);
  }
  return url.toString();
}

/** Construye deep-link bidireccional desde la Ficha del Mural o Landing hacia el Mundo 3D. */
export function buildWorld3DDeepLink(
  worldBaseUrl: string,
  options?: { memorialId?: string; profileSlug?: string | null; spaceId?: string | null }
): string {
  const url = new URL(worldBaseUrl);
  if (options?.spaceId) url.searchParams.set('space_id', options.spaceId);
  if (options?.memorialId) url.searchParams.set('memorial_id', options.memorialId);
  if (options?.profileSlug) url.searchParams.set('slug', options.profileSlug);
  url.searchParams.set('source', 'web_angeles');
  return url.toString();
}

/** Comprueba si una familia con memorial ya pagado tiene derecho a ocupar un `spaceId` del plan indicado. */
export function canExistingPaidMemorialClaimWorldSpace(
  memorial: {
    id: string;
    payment_status: string;
    publication_status: string;
    moderation_status: string;
    plan_type: string;
    expires_at?: string | null;
  },
  targetSpacePlanId: PlanId,
  alreadyAllocatedSpaceId: string | null,
  nowMs: number = Date.now()
): { allowed: boolean; reason: string } {
  if (memorial.payment_status !== 'paid' || memorial.publication_status !== 'published') {
    return { allowed: false, reason: 'MEMORIAL_NOT_PAID_OR_UNPUBLISHED' };
  }
  if (memorial.moderation_status === 'rejected') {
    return { allowed: false, reason: 'MEMORIAL_MODERATED' };
  }
  if (memorial.expires_at && Date.parse(memorial.expires_at) <= nowMs) {
    return { allowed: false, reason: 'MEMORIAL_EXPIRED' };
  }
  const memorialPlanId = normalizePlanId(memorial.plan_type);
  if (!memorialPlanId) {
    return { allowed: false, reason: 'UNKNOWN_MEMORIAL_PLAN' };
  }
  if (memorialPlanId !== targetSpacePlanId) {
    return { allowed: false, reason: 'PLAN_MISMATCH' };
  }
  if (alreadyAllocatedSpaceId) {
    return { allowed: false, reason: 'MEMORIAL_ALREADY_HAS_WORLD_SPACE' };
  }
  return { allowed: true, reason: 'OK' };
}
