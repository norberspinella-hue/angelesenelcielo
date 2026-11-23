import { getPlan, getPlanByDbName, getPlanOrDefault, PlanConfig, PlanId } from '@/lib/plans';
import { GRID_COLS, GRID_ROWS, PREMIUM_ZONE } from '@/lib/mural/gridMath';

export interface SlotCellState {
  x: number;
  y: number;
  status: string;
  reserved_until?: string | null;
  memorial_id?: string | null;
}

/**
 * Determina si una celda de `mural_slots` bloquea el uso de un bloque nuevo.
 * Respeta reservas temporales vigentes (`reserved_pending_payment` con `reserved_until > now`)
 * e ignora reservas cuyo TTL ya caducó.
 */
export function isSlotCellBlocking(
  cell: Pick<SlotCellState, 'status' | 'reserved_until'>,
  nowMs: number = Date.now(),
  ignoreHoldIfTokenMatches: boolean = false
): boolean {
  if (ignoreHoldIfTokenMatches && cell.status === 'reserved_pending_payment') {
    return false;
  }
  if (cell.status === 'occupied' || cell.status === 'blocked_admin' || cell.status === 'sponsor_private') {
    return true;
  }
  if (cell.status === 'reserved_pending_payment') {
    if (!cell.reserved_until) return true;
    const expiresMs = Date.parse(cell.reserved_until);
    return Number.isNaN(expiresMs) ? true : expiresMs > nowMs;
  }
  return false;
}

/**
 * Comprueba que el bloque completo de `blockSize × blockSize` cabe dentro del tablero
 * `1000 × 1000` y no colisiona con ninguna celda ocupada ni reserva activa.
 */
export function isBlockGridValidAndFree(
  startX: number,
  startY: number,
  blockSize: number,
  fetchedCells: SlotCellState[],
  nowMs: number = Date.now(),
  allowHoldIds?: Set<string>
): { ok: boolean; reason?: 'OUT_OF_BOUNDS' | 'COLLISION' | 'INVALID_SIZE' } {
  if (!Number.isInteger(blockSize) || blockSize < 1 || blockSize > 6) {
    return { ok: false, reason: 'INVALID_SIZE' };
  }
  if (
    !Number.isInteger(startX) ||
    !Number.isInteger(startY) ||
    startX < 0 ||
    startY < 0 ||
    startX + blockSize > GRID_COLS ||
    startY + blockSize > GRID_ROWS
  ) {
    return { ok: false, reason: 'OUT_OF_BOUNDS' };
  }

  for (const cell of fetchedCells) {
    if (
      cell.x >= startX &&
      cell.x < startX + blockSize &&
      cell.y >= startY &&
      cell.y < startY + blockSize
    ) {
      const ownedBySelf = Boolean(cell.memorial_id && allowHoldIds?.has(cell.memorial_id));
      if (!ownedBySelf && isSlotCellBlocking(cell, nowMs)) {
        return { ok: false, reason: 'COLLISION' };
      }
    }
  }

  return { ok: true };
}

/**
 * Genera las coordenadas exactas (`size × size`) de un bloque en el mural.
 */
export function expandBlockCoordinates(
  startX: number,
  startY: number,
  blockSize: number
): Array<{ x: number; y: number }> {
  const coords: Array<{ x: number; y: number }> = [];
  for (let dx = 0; dx < blockSize; dx++) {
    for (let dy = 0; dy < blockSize; dy++) {
      coords.push({ x: startX + dx, y: startY + dy });
    }
  }
  return coords;
}

/**
 * Evalúa si alguna celda del bloque `size × size` toca la zona de Ángeles Fundadores (`PREMIUM_ZONE`).
 */
export function blockTouchesFounderZone(startX: number, startY: number, blockSize: number): boolean {
  const endX = startX + blockSize - 1;
  const endY = startY + blockSize - 1;
  const pzEndX = PREMIUM_ZONE.x + PREMIUM_ZONE.w - 1;
  const pzEndY = PREMIUM_ZONE.y + PREMIUM_ZONE.h - 1;

  return !(endX < PREMIUM_ZONE.x || startX > pzEndX || endY < PREMIUM_ZONE.y || startY > pzEndY);
}

/**
 * Devuelve `slotsCount` real sin truncar jamás a 9 (corrige el límite heredado de 4x4/5x5/6x6).
 */
export function resolveCanonicalPlanMetrics(planIdOrDbName: string | null | undefined): {
  config: PlanConfig;
  size: number;
  slotsCount: number;
  isFounderEligible: boolean;
} {
  const config = getPlan(planIdOrDbName) ?? getPlanByDbName(planIdOrDbName) ?? getPlanOrDefault(planIdOrDbName);
  const founderPlans: PlanId[] = ['corazon_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'];
  return {
    config,
    size: config.size,
    slotsCount: config.size * config.size,
    isFounderEligible: founderPlans.includes(config.id),
  };
}
