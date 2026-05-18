import type { ZoomLevel, ViewportState, VisibleRange } from './muralTypes'

// ─── Logical grid dimensions ──────────────────────────────────────────────────
// The real mural is 1000×1000 = 1,000,000 slots.
// We NEVER render all of them. Only what's visible in the viewport.

export const GRID_COLS = 1000
export const GRID_ROWS = 1000
export const TOTAL_SLOTS = GRID_COLS * GRID_ROWS // 1,000,000

// ─── Slot pixel size per zoom level ──────────────────────────────────────────
export const ZOOM_SLOT_SIZES: Record<ZoomLevel, number> = {
  0: 8,   // Overview:   tiny dots, see the whole mural density
  1: 14,  // Half:       small squares, shapes visible
  2: 24,  // 1× base:    thumbnails legible
  3: 44,  // 2× detail:  faces visible
  4: 80,  // 4× close:   full detail, read name
}

export const ZOOM_GAP: Record<ZoomLevel, number> = {
  0: 1,
  1: 2,
  2: 2,
  3: 2,
  4: 3,
}

export const ZOOM_LABELS: Record<ZoomLevel, string> = {
  0: '¼×',
  1: '½×',
  2: '1×',
  3: '2×',
  4: '4×',
}

export const ZOOM_LEVELS: ZoomLevel[] = [0, 1, 2, 3, 4]

// ─── Premium zone (center of the logical grid) ───────────────────────────────
export const PREMIUM_ZONE = {
  x: 460,
  y: 460,
  w: 80,
  h: 80,
}

// ─── Grid math ────────────────────────────────────────────────────────────────

/**
 * Returns the size of a slot (including gap) at a given zoom level.
 */
export function getSlotStep(zoom: ZoomLevel): number {
  return ZOOM_SLOT_SIZES[zoom] + ZOOM_GAP[zoom]
}

/**
 * Calculates which grid columns and rows are visible in the current viewport.
 * This is the core of the virtualization — only the visible range gets rendered.
 *
 * @param viewport - current pan offset + dimensions + zoom
 * @returns  { colStart, colEnd, rowStart, rowEnd, totalVisible }
 */
export function getVisibleRange(viewport: ViewportState): VisibleRange {
  const step = getSlotStep(viewport.zoomLevel)

  const colStart = Math.max(0, Math.floor(-viewport.x / step))
  const colEnd   = Math.min(GRID_COLS - 1, colStart + Math.ceil(viewport.width  / step) + 1)
  const rowStart = Math.max(0, Math.floor(-viewport.y / step))
  const rowEnd   = Math.min(GRID_ROWS - 1, rowStart + Math.ceil(viewport.height / step) + 1)

  return {
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    totalVisible: (colEnd - colStart + 1) * (rowEnd - rowStart + 1),
  }
}

/**
 * Converts a logical grid coordinate to screen pixel position.
 */
export function gridToScreen(
  col: number,
  row: number,
  viewport: ViewportState,
): { x: number; y: number } {
  const step = getSlotStep(viewport.zoomLevel)
  return {
    x: viewport.x + col * step,
    y: viewport.y + row * step,
  }
}

/**
 * Returns pan values to center the premium zone in a given viewport.
 */
export function getPanToCenterPremiumZone(
  viewportWidth: number,
  viewportHeight: number,
  zoom: ZoomLevel,
): { x: number; y: number } {
  const step = getSlotStep(zoom)
  const zoneCenterX = (PREMIUM_ZONE.x + PREMIUM_ZONE.w / 2) * step
  const zoneCenterY = (PREMIUM_ZONE.y + PREMIUM_ZONE.h / 2) * step
  return {
    x: viewportWidth  / 2 - zoneCenterX,
    y: viewportHeight / 2 - zoneCenterY,
  }
}

/**
 * Clamps pan values so the grid never drifts too far off screen.
 */
export function clampPan(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  zoom: ZoomLevel,
): { x: number; y: number } {
  const step    = getSlotStep(zoom)
  const totalW  = GRID_COLS * step
  const totalH  = GRID_ROWS * step
  const padding = 120

  return {
    x: Math.max(-(totalW - viewportWidth + padding), Math.min(padding, x)),
    y: Math.max(-(totalH - viewportHeight + padding), Math.min(padding, y)),
  }
}
