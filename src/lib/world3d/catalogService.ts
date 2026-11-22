import { PlanId } from '@/lib/plans';
import { normalizePlanId } from './contracts';

/** Registro mínimo leído de `public.memorials` para construir el catálogo 3D sin depender de velas. */
export interface RawMemorialCatalogRow {
  id: string;
  pet_name: string;
  species: string | null;
  breed?: string | null;
  photo_url: string | null;
  dedication: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  plan_type: string;
  slots_count: number;
  payment_status: string;
  publication_status: string;
  visibility: string;
  moderation_status: string;
  profile_slug: string | null;
  slot_assigned?: string | null;
  expires_at?: string | null;
  story_answers?: Record<string, any> | null;
  created_at?: string;
}

export interface WorldAllocationLookup {
  memorial_id: string;
  space_id: string;
  status: string;
}

export interface CatalogMemorial3DItem {
  memorialId: string;
  profileSlug: string | null;
  petName: string;
  species: string;
  breed: string;
  photoUrl: string;
  dedication: string;
  planId: PlanId;
  muralSlotsCount: number;
  catalogKind: 'mural_paid' | 'shelter' | 'community_free';
  isPaidMural: boolean;
  isFounder: boolean;
  muralCoords: { x: number; y: number } | null;
  muralUrl: string;
  memorialUrl: string | null;
  worldSpaceId: string | null;
  hasActiveCandle: boolean;
}

export function parseSlotCoords(slotAssigned?: string | null): { x: number; y: number } | null {
  if (!slotAssigned || !slotAssigned.includes(',')) return null;
  const [xStr, yStr] = slotAssigned.split(',');
  const x = parseInt(xStr.trim(), 10);
  const y = parseInt(yStr.trim(), 10);
  if (Number.isNaN(x) || Number.isNaN(y) || x < 0 || x >= 1000 || y < 0 || y >= 1000) return null;
  return { x, y };
}

/**
 * Construye el catálogo público de mascotas elegibles para el Mundo 3D
 * directamente desde `public.memorials`, eliminando la dependencia de `altar_candles`.
 *
 * Reglas:
 * - Solo registros `visibility === 'public'`, `publication_status === 'published'` y `moderation_status !== 'rejected'`.
 * - Por defecto (`includeCommunityFree = false`) devuelve los memoriales del Mural con `payment_status === 'paid'`
 *   vigentes aunque NO tengan vela encendida en `altar_candles`.
 * - Opcionalmente (`includeCommunityFree = true`) permite listar también recuerdos comunitarios gratuitos
 *   sin mezclar su identidad (cada entrada conserva `memorialId` y `catalogKind` único, evitando choques
 *   como el doble registro de `House`).
 */
export function buildPublic3DMuralCatalog(
  rows: RawMemorialCatalogRow[],
  options?: {
    includeCommunityFree?: boolean;
    allocations?: WorldAllocationLookup[];
    activeCandleMemorialIds?: Set<string>;
    webBaseUrl?: string;
    nowMs?: number;
  }
): CatalogMemorial3DItem[] {
  const includeCommunityFree = Boolean(options?.includeCommunityFree);
  const nowMs = options?.nowMs ?? Date.now();
  const webBaseUrl = (options?.webBaseUrl || 'https://todaslasmascotasvanalcielo.com').replace(/\/$/, '');

  const spaceByMemorialId = new Map<string, string>();
  for (const alloc of options?.allocations || []) {
    if (alloc.memorial_id && alloc.status === 'occupied') {
      spaceByMemorialId.set(alloc.memorial_id, alloc.space_id);
    }
  }

  const seenMemorialIds = new Set<string>();
  const items: CatalogMemorial3DItem[] = [];

  for (const row of rows) {
    if (!row.id || seenMemorialIds.has(row.id)) continue;
    if (row.visibility !== 'public' || row.publication_status !== 'published') continue;
    if (row.moderation_status === 'rejected') continue;

    const isCommunity = Boolean(row.story_answers?.isCommunity);
    const isShelter = Boolean(row.story_answers?.isShelter || row.story_answers?.shelterName);
    const isPaid = row.payment_status === 'paid';

    if (!isPaid && !(includeCommunityFree && isCommunity)) {
      continue;
    }

    if (isPaid && row.expires_at) {
      const exp = Date.parse(row.expires_at);
      if (!Number.isNaN(exp) && exp <= nowMs) continue;
    }

    const planId = normalizePlanId(row.plan_type) || 'huellita';
    const muralCoords = parseSlotCoords(row.slot_assigned);
    const catalogKind: CatalogMemorial3DItem['catalogKind'] = isShelter
      ? 'shelter'
      : isPaid
        ? 'mural_paid'
        : 'community_free';

    seenMemorialIds.add(row.id);

    const memorialUrl = row.profile_slug
      ? `${webBaseUrl}/memorial/${row.profile_slug}`
      : null;
    const muralUrl = muralCoords
      ? `${webBaseUrl}/mural-global?highlight=${muralCoords.x},${muralCoords.y}&zoom=true`
      : `${webBaseUrl}/mural-global?memorialId=${row.id}`;

    items.push({
      memorialId: row.id,
      profileSlug: row.profile_slug || null,
      petName: row.pet_name || 'Ángel',
      species: row.species || 'otro',
      breed: row.breed || '',
      photoUrl: row.photo_url || '/images/placeholders/first.webp',
      dedication: row.dedication || '',
      planId,
      // Usamos tamaño canónico del plan para no propagar registros heredados truncados a 9
      muralSlotsCount:
        planId === 'vinculo_infinito' ? 36 :
        planId === 'galaxia_amor' ? 25 :
        planId === 'angelito_protector' ? 16 :
        planId === 'corazon_eterno' ? 9 :
        planId === 'estrella_brillante' ? 4 : 1,
      catalogKind,
      isPaidMural: isPaid,
      isFounder: ['corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'].includes(planId),
      muralCoords,
      muralUrl,
      memorialUrl,
      worldSpaceId: spaceByMemorialId.get(row.id) || null,
      hasActiveCandle: Boolean(options?.activeCandleMemorialIds?.has(row.id)),
    });
  }

  return items;
}
