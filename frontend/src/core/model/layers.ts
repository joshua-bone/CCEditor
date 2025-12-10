// frontend/src/core/model/layers.ts

import type { Size, LevelId, LayerId, Coords } from './types';
import type { Grid } from './grid';
import type { GameCellBase, GameLevelMetadata } from './gameTypes';
import type { SelectionRect } from './selection';
import { iterSelection } from './selection';
import type { LayerClipboard } from './clipboard';
import { copyGridRegionToClipboard, pasteClipboardOntoGrid } from './clipboard';

export type Transparent = null;

export interface LogicalLayer<TCell extends GameCellBase> {
  id: LayerId;
  name: string;
  visible: boolean;
  grid: Grid<TCell | Transparent>;
}

export interface LevelWithLayers<TCell extends GameCellBase> {
  id: LevelId;
  name: string;
  size: Size;
  meta: GameLevelMetadata;
  layers: LogicalLayer<TCell>[]; // background layer is always index 0
  activeLayerId: LayerId;
}

// ---------- internal helpers ----------

function findLayerIndex<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  layerId: LayerId,
): number {
  const idx = level.layers.findIndex((l) => l.id === layerId);
  if (idx === -1) {
    throw new Error(`Layer not found: ${layerId}`);
  }
  return idx;
}

function normalizeInsertionIndex<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  index: number,
): number {
  // 0 is background; don't allow insertion before it.
  const min = 1;
  const max = level.layers.length; // insertion at length = append
  return Math.min(Math.max(index, min), max);
}

function generateLayerId<TCell extends GameCellBase>(level: LevelWithLayers<TCell>): LayerId {
  // Simple unique-ish ID; we can improve later if needed.
  let n = level.layers.length;
  let candidate: LayerId;
  const existing = new Set(level.layers.map((l) => l.id));

  do {
    candidate = `layer-${n++}`;
  } while (existing.has(candidate));

  return candidate;
}

// ---------- operations ----------

export function addLayer<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  name: string,
  index?: number,
): LevelWithLayers<TCell> {
  const insertionIndex =
    index !== undefined
      ? normalizeInsertionIndex(level, index)
      : (() => {
          const activeIndex = findLayerIndex(level, level.activeLayerId);
          return normalizeInsertionIndex(level, activeIndex + 1);
        })();

  const id = generateLayerId(level);

  // New layer starts fully transparent.
  const emptyGrid: Grid<TCell | Transparent> = level.layers[0].grid.map(() => null);

  const newLayer: LogicalLayer<TCell> = {
    id,
    name,
    visible: true,
    grid: emptyGrid,
  };

  const layers = [
    ...level.layers.slice(0, insertionIndex),
    newLayer,
    ...level.layers.slice(insertionIndex),
  ];

  return {
    ...level,
    layers,
    activeLayerId: id,
  };
}

export function removeLayer<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  layerId: LayerId,
): LevelWithLayers<TCell> {
  const index = findLayerIndex(level, layerId);

  if (index === 0) {
    throw new Error('Cannot remove background layer');
  }

  const layers = level.layers.slice();
  layers.splice(index, 1);

  let activeLayerId = level.activeLayerId;
  if (layerId === level.activeLayerId) {
    const newIndex = Math.min(index, layers.length - 1);
    activeLayerId = layers[newIndex].id;
  }

  return {
    ...level,
    layers,
    activeLayerId,
  };
}

export function reorderLayer<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  layerId: LayerId,
  newIndex: number,
): LevelWithLayers<TCell> {
  const currentIndex = findLayerIndex(level, layerId);

  if (currentIndex === 0) {
    // Background cannot move
    if (newIndex === 0) {
      return level;
    }
    throw new Error('Cannot reorder background layer');
  }

  const clampedIndex = normalizeInsertionIndex(level, newIndex);

  if (currentIndex === clampedIndex) {
    return level;
  }

  const layers = level.layers.slice();
  const [layer] = layers.splice(currentIndex, 1);
  layers.splice(clampedIndex, 0, layer);

  return {
    ...level,
    layers,
  };
}

export function setLayerVisibility<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  layerId: LayerId,
  visible: boolean,
): LevelWithLayers<TCell> {
  const index = findLayerIndex(level, layerId);
  const layers = level.layers.slice();
  const layer = layers[index];

  if (layer.visible === visible) {
    return level;
  }

  layers[index] = { ...layer, visible };

  return {
    ...level,
    layers,
  };
}

export function newLayerFromSelection<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  selection: SelectionRect,
  sourceLayerId: LayerId,
  newLayerName: string,
): LevelWithLayers<TCell> {
  const sourceIndex = findLayerIndex(level, sourceLayerId);
  const sourceLayer = level.layers[sourceIndex];

  const backgroundGrid = level.layers[0].grid;

  // Start with a transparent grid of the same size.
  let newGrid: Grid<TCell | Transparent> = backgroundGrid.map(() => null);

  const size = level.size;

  // Copy only selected, in-bounds, non-null cells from source layer.
  for (const coords of iterSelection(selection)) {
    const { x, y } = coords;
    if (x < 0 || y < 0 || x >= size.width || y >= size.height) continue;

    const srcValue = sourceLayer.grid.get(coords);
    if (srcValue !== null) {
      newGrid = newGrid.set(coords, srcValue);
    }
  }

  const id = generateLayerId(level);

  const newLayer: LogicalLayer<TCell> = {
    id,
    name: newLayerName,
    visible: true,
    grid: newGrid,
  };

  const insertionIndex = sourceIndex + 1;
  const layers = [
    ...level.layers.slice(0, insertionIndex),
    newLayer,
    ...level.layers.slice(insertionIndex),
  ];

  return {
    ...level,
    layers,
    activeLayerId: id,
  };
}

// ---------- layer-level clipboard helpers ----------

export function copySelection<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  selection: SelectionRect,
  sourceLayerId: LayerId,
): LayerClipboard<TCell> {
  const index = findLayerIndex(level, sourceLayerId);
  const layer = level.layers[index];

  // Note: this treats `null` as a real value; we can refine the type later
  // to use LayerClipboard<TCell | null> if we want to track transparency.
  return copyGridRegionToClipboard(layer.grid as Grid<TCell>, selection);
}

export function pasteClipboard<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  clipboard: LayerClipboard<TCell>,
  targetLayerId: LayerId,
  anchor: Coords,
): LevelWithLayers<TCell> {
  const index = findLayerIndex(level, targetLayerId);
  const layer = level.layers[index];

  const newGrid = pasteClipboardOntoGrid(layer.grid, clipboard, anchor);

  const layers = level.layers.slice();
  layers[index] = { ...layer, grid: newGrid };

  return {
    ...level,
    layers,
  };
}
