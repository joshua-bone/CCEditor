import { describe, it, expect } from 'vitest';
import { createSelectionRect, iterSelection, selectionWidth, selectionHeight } from '../selection';

describe('SelectionRect', () => {
  it('normalizes corners', () => {
    const rect = createSelectionRect({ x: 5, y: 7 }, { x: 2, y: 3 });
    expect(rect).toEqual({ x1: 2, y1: 3, x2: 5, y2: 7 });
  });

  it('width and height are inclusive', () => {
    const rect = createSelectionRect({ x: 1, y: 1 }, { x: 3, y: 2 });
    expect(selectionWidth(rect)).toBe(3);
    expect(selectionHeight(rect)).toBe(2);
  });

  it('iterSelection visits each coordinate', () => {
    const rect = createSelectionRect({ x: 1, y: 1 }, { x: 2, y: 3 });
    const coords = Array.from(iterSelection(rect));
    expect(coords).toHaveLength(6); // 2x3
    expect(coords[0]).toEqual({ x: 1, y: 1 });
    expect(coords[coords.length - 1]).toEqual({ x: 2, y: 3 });
  });
});
