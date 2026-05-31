import { GRID_COLS, GRID_ROWS } from './gridMath';

export type SeededSlot = {
  col: number;
  row: number;
  color: string;
};

// Golden ratio conjugate
const PHI_CONJUGATE = 0.618033988749895;

const PASTEL_COLORS = [
  '#F8C7D8', // pink-soft
  '#FFF5EE', // cream
  '#C8B6E8', // lavender
  '#FFE2A8', // gold-soft
  '#E6F0FA', // soft blue
];

export function generateSeedSlots(count: number): Map<string, SeededSlot> {
  const seedMap = new Map<string, SeededSlot>();
  


  return seedMap;
}
