// frontend/src/core/model/grid.ts
import type { Coords, Size } from './types';

export interface Grid<T> {
  readonly size: Size;
  readonly cells: readonly T[];

  get(coords: Coords): T;
  set(coords: Coords, value: T): Grid<T>;
  map(fn: (value: T, coords: Coords) => T): Grid<T>;
}

// Internal implementation using a flat array
class FlatGrid<T> implements Grid<T> {
  readonly size: Size;
  readonly cells: readonly T[];

  constructor(size: Size, cells: readonly T[]) {
    this.size = size;
    this.cells = cells;
  }

  get(coords: Coords): T {
    const index = indexFromCoords(this.size, coords);
    return this.cells[index];
  }

  set(coords: Coords, value: T): Grid<T> {
    const index = indexFromCoords(this.size, coords);
    const next = this.cells.slice();
    next[index] = value;
    return new FlatGrid(this.size, next);
  }

  map(fn: (value: T, coords: Coords) => T): Grid<T> {
    const { size } = this;
    const next = this.cells.map((value, index) => fn(value, coordsFromIndex(size, index)));
    return new FlatGrid(size, next);
  }
}

/**
 * Create a grid filled by a function of coordinates.
 */
export function createGrid<T>(size: Size, fill: (coords: Coords, index: number) => T): Grid<T> {
  const total = size.width * size.height;
  const cells = new Array<T>(total);

  for (let index = 0; index < total; index++) {
    const coords = coordsFromIndex(size, index);
    cells[index] = fill(coords, index);
  }

  return new FlatGrid(size, cells);
}

export function inBounds(size: Size, coords: Coords): boolean {
  return coords.x >= 0 && coords.y >= 0 && coords.x < size.width && coords.y < size.height;
}

export function indexFromCoords(size: Size, coords: Coords): number {
  if (!inBounds(size, coords)) {
    throw new RangeError(`Coords out of bounds: (${coords.x}, ${coords.y})`);
  }
  return coords.y * size.width + coords.x;
}

export function coordsFromIndex(size: Size, index: number): Coords {
  if (index < 0 || index >= size.width * size.height) {
    throw new RangeError(`Index out of bounds: ${index}`);
  }
  return {
    x: index % size.width,
    y: Math.floor(index / size.width),
  };
}
