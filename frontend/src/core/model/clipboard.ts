// frontend/src/core/model/clipboard.ts
import type { Coords, Size } from './types';
import type { Grid } from './grid';
import { selectionWidth, selectionHeight, type SelectionRect } from './selection';

/**
 * Rectangular snippet from a single logical layer.
 * cells[y][x] = TCell | null, where null means "transparent / no-op when pasting".
 */
export interface LayerClipboard<TCell> {
  readonly size: Size;
  readonly cells: (TCell | null)[][];
}

/**
 * Copy a rectangular region of a grid into a LayerClipboard.
 * For now we always copy actual cell values (no nulls).
 */
export function copyGridRegionToClipboard<TCell>(
  grid: Grid<TCell>,
  rect: SelectionRect,
): LayerClipboard<TCell> {
  const width = selectionWidth(rect);
  const height = selectionHeight(rect);

  const cells: (TCell | null)[][] = [];

  for (let dy = 0; dy < height; dy++) {
    const row: (TCell | null)[] = [];
    for (let dx = 0; dx < width; dx++) {
      const src: Coords = { x: rect.x1 + dx, y: rect.y1 + dy };
      row.push(grid.get(src));
    }
    cells.push(row);
  }

  return {
    size: { width, height },
    cells,
  };
}

/**
 * Paste a clipboard into a grid at a given top-left anchor.
 * null cells in the clipboard are treated as "leave destination unchanged".
 */
export function pasteClipboardOntoGrid<TCell>(
  grid: Grid<TCell>,
  clipboard: LayerClipboard<TCell>,
  topLeft: Coords,
): Grid<TCell> {
  let result = grid;

  for (let y = 0; y < clipboard.size.height; y++) {
    for (let x = 0; x < clipboard.size.width; x++) {
      const value = clipboard.cells[y][x];
      if (value === null) continue;

      const dest: Coords = { x: topLeft.x + x, y: topLeft.y + y };
      result = result.set(dest, value);
    }
  }

  return result;
}
