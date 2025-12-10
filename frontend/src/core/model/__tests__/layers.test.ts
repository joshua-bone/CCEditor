import { describe, it, expect } from 'vitest';
import { createGrid } from '../grid';
import { createSelectionRect } from '../selection';
import {
  addLayer,
  removeLayer,
  reorderLayer,
  setLayerVisibility,
  newLayerFromSelection,
  copySelection,
  pasteClipboard,
  type LevelWithLayers,
  type LogicalLayer,
} from '../layers';
import type { GameCellBase } from '../gameTypes';
import type { Size } from '../types';

interface TestCell extends GameCellBase {
  value: string;
}

function makeCell(value: string): TestCell {
  return { gameId: 'cc1', value };
}

function makeBaseLevel(size: Size): LevelWithLayers<TestCell> {
  const grid = createGrid<TestCell | null>(size, () => makeCell('.'));
  const background: LogicalLayer<TestCell> = {
    id: 'layer-background',
    name: 'Background',
    visible: true,
    grid,
  };

  return {
    id: 'level-1',
    name: 'Test Level',
    size,
    meta: {},
    layers: [background],
    activeLayerId: background.id,
  };
}

describe('addLayer', () => {
  it('inserts a transparent layer above active by default', () => {
    const level = makeBaseLevel({ width: 2, height: 2 });
    const level2 = addLayer(level, 'New Layer');

    expect(level2.layers).toHaveLength(2);
    expect(level2.layers[1].name).toBe('New Layer');
    expect(level2.activeLayerId).toBe(level2.layers[1].id);
    // background stays at index 0
    expect(level2.layers[0].id).toBe('layer-background');
  });
});

describe('removeLayer', () => {
  it('cannot remove background', () => {
    const level = makeBaseLevel({ width: 2, height: 2 });
    expect(() => removeLayer(level, 'layer-background')).toThrow();
  });

  it('reassigns active layer when removed', () => {
    let level = makeBaseLevel({ width: 2, height: 2 });
    level = addLayer(level, 'Top');
    const topId = level.activeLayerId;

    const level2 = removeLayer(level, topId);
    expect(level2.layers).toHaveLength(1);
    expect(level2.activeLayerId).toBe('layer-background');
  });
});

describe('reorderLayer', () => {
  it('moves non-background layers but keeps background at index 0', () => {
    let level = makeBaseLevel({ width: 2, height: 2 });
    level = addLayer(level, 'L1');
    level = addLayer(level, 'L2');

    const l1Id = level.layers[1].id;
    const level2 = reorderLayer(level, l1Id, 2);

    expect(level2.layers[2].id).toBe(l1Id);
    expect(level2.layers[0].id).toBe('layer-background');
  });
});

describe('setLayerVisibility', () => {
  it('toggles visibility on a given layer', () => {
    let level = makeBaseLevel({ width: 2, height: 2 });
    level = addLayer(level, 'Top');
    const topId = level.activeLayerId;

    const hidden = setLayerVisibility(level, topId, false);
    const topLayer = hidden.layers.find((l) => l.id === topId)!;
    expect(topLayer.visible).toBe(false);
  });
});

describe('newLayerFromSelection', () => {
  it('copies only selected region into new layer', () => {
    const size = { width: 3, height: 3 };
    let level = makeBaseLevel(size);

    // Put distinct values into background layer
    const bgGrid = level.layers[0].grid.map((_cell, { x, y }) => makeCell(`${x},${y}`));
    level = {
      ...level,
      layers: [{ ...level.layers[0], grid: bgGrid }],
    };

    const rect = createSelectionRect({ x: 1, y: 1 }, { x: 2, y: 2 });
    const level2 = newLayerFromSelection(level, rect, 'layer-background', 'Selection Layer');

    const newLayer = level2.layers[1];
    // Cells inside selection should be non-null, outside should be null
    expect((newLayer.grid.get({ x: 1, y: 1 }) as TestCell | null)?.value).toBe('1,1');
    expect(newLayer.grid.get({ x: 0, y: 0 })).toBeNull();
  });
});

describe('copySelection / pasteClipboard', () => {
  it('round-trips content via clipboard', () => {
    const size = { width: 3, height: 3 };
    let level = makeBaseLevel(size);

    const bgGrid = level.layers[0].grid.map((_cell, { x, y }) => makeCell(`${x},${y}`));
    level = {
      ...level,
      layers: [{ ...level.layers[0], grid: bgGrid }],
    };

    const rect = createSelectionRect({ x: 1, y: 1 }, { x: 2, y: 2 });
    const clip = copySelection(level, rect, 'layer-background');

    level = addLayer(level, 'Paste Target');
    const targetId = level.activeLayerId;

    const level2 = pasteClipboard(level, clip, targetId, { x: 0, y: 0 });
    const pastedLayer = level2.layers.find((l) => l.id === targetId)!;

    expect((pastedLayer.grid.get({ x: 0, y: 0 }) as TestCell | null)?.value).toBe('1,1');
  });
});
