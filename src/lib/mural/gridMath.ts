export const GRID_COLS = 1000;
export const GRID_ROWS = 1000;
export const TOTAL_SLOTS = GRID_COLS * GRID_ROWS;

export const BASE_SLOT = 16; // 1x zoom slot size (increased for better default visibility)
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 8;
export const ZOOM_FACTOR = 1.15;

export const PREMIUM_ZONE = {
  x: 460,
  y: 460,
  w: 80,
  h: 80,
};

export type ViewportState = {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
};

export type VisibleRange = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
  totalVisible: number;
};

export function getSlotSize(zoom: number): number {
  return BASE_SLOT * zoom;
}

export function getVisibleRange(viewport: ViewportState): VisibleRange {
  const slotSize = getSlotSize(viewport.zoom);
  
  const colStart = Math.max(0, Math.floor(-viewport.x / slotSize));
  const colEnd = Math.min(GRID_COLS - 1, colStart + Math.ceil(viewport.width / slotSize) + 1);
  const rowStart = Math.max(0, Math.floor(-viewport.y / slotSize));
  const rowEnd = Math.min(GRID_ROWS - 1, rowStart + Math.ceil(viewport.height / slotSize) + 1);

  return {
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    totalVisible: (colEnd - colStart + 1) * (rowEnd - rowStart + 1),
  };
}

export function gridToScreen(
  col: number,
  row: number,
  viewport: ViewportState
): { x: number; y: number } {
  const slotSize = getSlotSize(viewport.zoom);
  return {
    x: viewport.x + col * slotSize,
    y: viewport.y + row * slotSize,
  };
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  viewport: ViewportState
): { col: number; row: number } | null {
  const slotSize = getSlotSize(viewport.zoom);
  const col = Math.floor((screenX - viewport.x) / slotSize);
  const row = Math.floor((screenY - viewport.y) / slotSize);
  
  if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
    return { col, row };
  }
  return null;
}

export function getPanToCenterPremiumZone(
  viewportWidth: number,
  viewportHeight: number,
  zoom: number
): { x: number; y: number } {
  const slotSize = getSlotSize(zoom);
  const zoneCenterX = (PREMIUM_ZONE.x + PREMIUM_ZONE.w / 2) * slotSize;
  const zoneCenterY = (PREMIUM_ZONE.y + PREMIUM_ZONE.h / 2) * slotSize;
  return {
    x: viewportWidth / 2 - zoneCenterX,
    y: viewportHeight / 2 - zoneCenterY,
  };
}

export function clampPan(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number
): { x: number; y: number } {
  const slotSize = getSlotSize(zoom);
  const totalW = GRID_COLS * slotSize;
  const totalH = GRID_ROWS * slotSize;
  const padding = 150; // pixels of padding allowed

  return {
    x: Math.max(-(totalW - viewportWidth + padding), Math.min(padding, x)),
    y: Math.max(-(totalH - viewportHeight + padding), Math.min(padding, y)),
  };
}
