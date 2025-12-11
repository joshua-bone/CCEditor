// frontend/src/core/app/paintGeometry.ts

import type { Coords } from '../model/types';

/**
 * Inclusive line from a to b (excluding a, including b).
 * Used for strokes between two grid cells.
 */
export function linePoints(a: Coords, b: Coords): Coords[] {
  const points: Coords[] = [];
  let x0 = a.x;
  let y0 = a.y;
  const x1 = b.x;
  const y1 = b.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let err = dx - dy;

  while (x0 !== x1 || y0 !== y1) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
    points.push({ x: x0, y: y0 });
  }

  return points;
}

/**
 * Filled rectangle (inclusive), top-left/bottom-right.
 */
export function rectFillPoints(topLeft: Coords, bottomRight: Coords): Coords[] {
  const points: Coords[] = [];
  for (let y = topLeft.y; y <= bottomRight.y; y += 1) {
    for (let x = topLeft.x; x <= bottomRight.x; x += 1) {
      points.push({ x, y });
    }
  }
  return points;
}

/**
 * Rectangle outline (hollow), top-left/bottom-right.
 */
export function rectOutlinePoints(topLeft: Coords, bottomRight: Coords): Coords[] {
  const points: Coords[] = [];
  for (let x = topLeft.x; x <= bottomRight.x; x += 1) {
    points.push({ x, y: topLeft.y });
    points.push({ x, y: bottomRight.y });
  }
  for (let y = topLeft.y + 1; y < bottomRight.y; y += 1) {
    points.push({ x: topLeft.x, y });
    points.push({ x: bottomRight.x, y });
  }
  return points;
}

/**
 * Approximate ellipse inside the bounding rectangle.
 * Returns the set of grid points that should be painted (outline only).
 */
export function ellipseOutlinePoints(topLeft: Coords, bottomRight: Coords): Coords[] {
  const points: Coords[] = [];

  const centerX = (topLeft.x + bottomRight.x) / 2;
  const centerY = (topLeft.y + bottomRight.y) / 2;
  const radiusX = Math.max(1, (bottomRight.x - topLeft.x) / 2);
  const radiusY = Math.max(1, (bottomRight.y - topLeft.y) / 2);

  // Sample around the ellipse with reasonable resolution.
  const steps = Math.max(8, Math.round(2 * Math.PI * Math.max(radiusX, radiusY)));

  const seen = new Set<string>();

  for (let i = 0; i < steps; i += 1) {
    const angle = (2 * Math.PI * i) / steps;
    const x = Math.round(centerX + radiusX * Math.cos(angle));
    const y = Math.round(centerY + radiusY * Math.sin(angle));
    const key = `${x},${y}`;
    if (!seen.has(key)) {
      seen.add(key);
      points.push({ x, y });
    }
  }

  return points;
}
