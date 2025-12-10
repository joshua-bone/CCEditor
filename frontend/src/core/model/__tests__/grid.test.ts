import { describe, it, expect } from 'vitest';
import { createGrid, indexFromCoords, coordsFromIndex } from '../grid';

describe('Grid indexing', () => {
  it('indexFromCoords and coordsFromIndex round-trip', () => {
    const size = { width: 4, height: 3 };
    const total = size.width * size.height;

    for (let index = 0; index < total; index++) {
      const coords = coordsFromIndex(size, index);
      const index2 = indexFromCoords(size, coords);
      expect(index2).toBe(index);
    }
  });

  it('createGrid fills with correct coords', () => {
    const size = { width: 2, height: 2 };
    const grid = createGrid(size, ({ x, y }) => y * 10 + x);

    expect(grid.get({ x: 0, y: 0 })).toBe(0);
    expect(grid.get({ x: 1, y: 0 })).toBe(1);
    expect(grid.get({ x: 0, y: 1 })).toBe(10);
    expect(grid.get({ x: 1, y: 1 })).toBe(11);
  });
});
