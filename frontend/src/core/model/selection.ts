// frontend/src/core/model/selection.ts
import type { Coords } from './types';

/**
 * Normalized, inclusive rectangle in grid coordinates.
 * (x1, y1) is top-left, (x2, y2) is bottom-right.
 */
export interface SelectionRect {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/**
 * Normalize two corners into a SelectionRect.
 */
export function createSelectionRect(a: Coords, b: Coords): SelectionRect {
  const x1 = Math.min(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const x2 = Math.max(a.x, b.x);
  const y2 = Math.max(a.y, b.y);
  return { x1, y1, x2, y2 };
}

export function selectionWidth(rect: SelectionRect): number {
  return rect.x2 - rect.x1 + 1;
}

export function selectionHeight(rect: SelectionRect): number {
  return rect.y2 - rect.y1 + 1;
}

/**
 * Iterate over all coordinates inside the rectangle (inclusive).
 */
export function* iterSelection(rect: SelectionRect): IterableIterator<Coords> {
  for (let y = rect.y1; y <= rect.y2; y++) {
    for (let x = rect.x1; x <= rect.x2; x++) {
      yield { x, y };
    }
  }
}
