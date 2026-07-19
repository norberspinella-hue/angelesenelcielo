// Script to parse path commands and find the center of the phone handset
const handsetPath = "M15.472 13.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347";

// Let's extract all the numeric tokens in order to find minX, maxX, minY, maxY
const numbers = handsetPath.match(/-?[\d.]+/g).map(Number);
let currentX = 0, currentY = 0;
let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;

// The first command is M15.472 13.382
currentX = numbers[0];
currentY = numbers[1];
updateBounds(currentX, currentY);

let index = 2;
// We can approximate the coordinates by parsing the SVG path format
// Since we only need an approximation of bounding box, let's look at the absolute points in the path:
// M15.472 13.382
// L / C commands follow. In our path:
// c -.297 -.149 (relative curve)
// Let's just track the relative offsets to find the exact trajectory.

const commands = handsetPath.split(/(?=[MmLlCcHhVvZz])/);
let cx = 0, cy = 0;

for (const cmd of commands) {
  const type = cmd[0];
  const args = cmd.slice(1).trim().split(/[\s,]+|(?=-)/).filter(Boolean).map(Number);
  
  if (type === 'M' || type === 'L') {
    cx = args[0];
    cy = args[1];
  } else if (type === 'm' || type === 'l') {
    cx += args[0];
    cy += args[1];
  } else if (type === 'c') {
    // Relative cubic bezier
    // args has 6 values per curve (dx1, dy1, dx2, dy2, dx, dy)
    for (let i = 0; i < args.length; i += 6) {
      cx += args[i+4];
      cy += args[i+5];
    }
  } else if (type === 'C') {
    for (let i = 0; i < args.length; i += 6) {
      cx = args[i+4];
      cy = args[i+5];
    }
  }
  updateBounds(cx, cy);
}

function updateBounds(x, y) {
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}

console.log(`Bounds: X=[${minX.toFixed(3)}, ${maxX.toFixed(3)}], Y=[${minY.toFixed(3)}, ${maxY.toFixed(3)}]`);
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
console.log(`Center: (${centerX.toFixed(3)}, ${centerY.toFixed(3)})`);

// We want the center of the phone to be at (12, 11) or (12, 12).
// In the bubble, the center of the circle is at (12, 11.5) or (12, 12).
// The outer bubble is drawn from M12.003 3.003a8.997 8.997 0 0 0 -8.997 8.997 ...
// The center of this circle is at (12, 12).
// So we want the center of the phone to be exactly at (12, 12).
// Offset required: dx = 12 - centerX, dy = 12 - centerY
const dx = 12 - centerX;
const dy = 12 - centerY;
console.log(`Required translate offset to center at (12, 12): dx=${dx.toFixed(3)}, dy=${dy.toFixed(3)}`);
