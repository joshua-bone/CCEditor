import { describe, it, expect } from 'vitest';
import { createGrid } from '../grid';
import { createSelectionRect } from '../selection';
import { copyGridRegionToClipboard, pasteClipboardOntoGrid } from '../clipboard';

describe('LayerClipboard', () => {
  it('copies and pastes a rectangular region', () => {
    const size = { width: 4, height: 4 };
    const grid = createGrid(size, ({ x, y }) => y * 10 + x);

    const rect = createSelectionRect({ x: 1, y: 1 }, { x: 2, y: 2 });
    const clipboard = copyGridRegionToClipboard(grid, rect);

    const pasted = pasteClipboardOntoGrid(grid, clipboard, { x: 0, y: 0 });

    expect(pasted.get({ x: 0, y: 0 })).toBe(grid.get({ x: 1, y: 1 }));
    expect(pasted.get({ x: 1, y: 1 })).toBe(grid.get({ x: 2, y: 2 }));
  });
});
