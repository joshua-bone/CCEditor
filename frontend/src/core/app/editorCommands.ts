// frontend/src/core/app/editorCommands.ts

import type { GameCellBase } from '../model/gameTypes';
import type { Coords, LevelId, LayerId } from '../model/types';
import type { SelectionRect } from '../model/selection';
import type { GameDefinition } from '../game/gameDefinition';
import type { EditorState } from './editorState';
import type { EditorHistory } from './editorHistory';
import {
  addLayer,
  removeLayer,
  reorderLayer,
  newLayerFromSelection,
  setLayerVisibility,
  type LevelWithLayers,
} from '../model/layers';

// ---------------------------------------------------------------------------
// Command definitions
// ---------------------------------------------------------------------------

export type EditorCommandType =
  | 'SET_ACTIVE_TOOL'
  | 'SET_SELECTION'
  | 'CLEAR_SELECTION'
  | 'PAINT_STROKE'
  | 'SET_CURRENT_LEVEL'
  | 'ADD_LEVEL'
  | 'DELETE_LEVEL'
  | 'REORDER_LEVEL'
  | 'ADD_LAYER'
  | 'REMOVE_LAYER'
  | 'REORDER_LAYER'
  | 'NEW_LAYER_FROM_SELECTION'
  | 'SET_LAYER_VISIBILITY'
  | 'SET_ACTIVE_LAYER'
  | 'RENAME_LAYER';

export interface SetActiveToolCommand {
  type: 'SET_ACTIVE_TOOL';
  toolId: string | null;
}

export interface SetSelectionCommand {
  type: 'SET_SELECTION';
  selection: SelectionRect | null;
}

export interface ClearSelectionCommand {
  type: 'CLEAR_SELECTION';
}

export interface PaintStrokeCommand {
  type: 'PAINT_STROKE';
  levelId: LevelId;
  layerId: LayerId;
  points: Coords[]; // stroke path in cell coordinates
  tileId: string;
  button: 'left' | 'right';
  mode?: 'normal' | 'bury'; // default 'normal'
}

export interface SetCurrentLevelCommand {
  type: 'SET_CURRENT_LEVEL';
  levelId: LevelId;
}

export interface AddLevelCommand {
  type: 'ADD_LEVEL';
  insertIndex?: number; // default: append
}

export interface DeleteLevelCommand {
  type: 'DELETE_LEVEL';
  levelId: LevelId;
}

export interface ReorderLevelCommand {
  type: 'REORDER_LEVEL';
  levelId: LevelId;
  newIndex: number;
}

export interface AddLayerCommand {
  type: 'ADD_LAYER';
  levelId: LevelId;
  name: string;
  index?: number;
}

export interface RemoveLayerCommand {
  type: 'REMOVE_LAYER';
  levelId: LevelId;
  layerId: LayerId;
}

export interface ReorderLayerCommand {
  type: 'REORDER_LAYER';
  levelId: LevelId;
  layerId: LayerId;
  newIndex: number;
}

export interface NewLayerFromSelectionCommand {
  type: 'NEW_LAYER_FROM_SELECTION';
  levelId: LevelId;
  sourceLayerId: LayerId;
  newLayerName: string;
}

export interface SetLayerVisibilityCommand {
  type: 'SET_LAYER_VISIBILITY';
  levelId: LevelId;
  layerId: LayerId;
  visible: boolean;
}

export interface SetActiveLayerCommand {
  type: 'SET_ACTIVE_LAYER';
  levelId: LevelId;
  layerId: LayerId;
}

export interface RenameLayerCommand {
  type: 'RENAME_LAYER';
  levelId: LevelId;
  layerId: LayerId;
  name: string;
}

export type EditorCommand =
  | SetActiveToolCommand
  | SetSelectionCommand
  | ClearSelectionCommand
  | PaintStrokeCommand
  | SetCurrentLevelCommand
  | AddLevelCommand
  | DeleteLevelCommand
  | ReorderLevelCommand
  | AddLayerCommand
  | RemoveLayerCommand
  | ReorderLayerCommand
  | NewLayerFromSelectionCommand
  | SetLayerVisibilityCommand
  | SetActiveLayerCommand
  | RenameLayerCommand;

function findLevelIndex<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  levelId: LevelId,
): number {
  const idx = state.levelset.levels.findIndex((lvl) => lvl.id === levelId);
  if (idx === -1) {
    throw new Error(`Level not found: ${levelId}`);
  }
  return idx;
}

function updateLevelAt<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  levelId: LevelId,
  updater: (level: LevelWithLayers<TCell>) => LevelWithLayers<TCell>,
): EditorState<TCell> {
  const idx = findLevelIndex(state, levelId);
  const levels = state.levelset.levels.slice();
  levels[idx] = updater(levels[idx]);

  return {
    ...state,
    levelset: {
      ...state.levelset,
      levels,
    },
  };
}

function paintCell<TCell extends GameCellBase>(
  level: LevelWithLayers<TCell>,
  layerId: LayerId,
  coords: Coords,
  tileId: string,
  gameDefinition: GameDefinition<TCell>,
  mode: 'normal' | 'bury',
): LevelWithLayers<TCell> {
  const layerIndex = level.layers.findIndex((l) => l.id === layerId);
  if (layerIndex === -1) {
    throw new Error(`Layer not found: ${layerId}`);
  }

  const layer = level.layers[layerIndex];
  const grid = layer.grid;

  const current = grid.get(coords);
  const baseCell = current === null ? gameDefinition.createEmptyCell() : current;

  const nextCell =
    mode === 'bury'
      ? gameDefinition.applyBuryPaint(baseCell, tileId)
      : gameDefinition.applyNormalPaint(baseCell, tileId, 'left');

  const nextGrid = grid.set(coords, nextCell);

  const layers = level.layers.slice();
  layers[layerIndex] = { ...layer, grid: nextGrid };

  return {
    ...level,
    layers,
  };
}

function paintStroke<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  command: PaintStrokeCommand,
  gameDefinition: GameDefinition<TCell>,
): EditorState<TCell> {
  const mode = command.mode ?? 'normal';

  return updateLevelAt(state, command.levelId, (level) => {
    let currentLevel = level;
    for (const coords of command.points) {
      currentLevel = paintCell(
        currentLevel,
        command.layerId,
        coords,
        command.tileId,
        gameDefinition,
        mode,
      );
    }
    return currentLevel;
  });
}

function addLevel<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  gameDefinition: GameDefinition<TCell>,
  insertIndex?: number,
): EditorState<TCell> {
  const baseLevelset = state.levelset;
  const size = baseLevelset.levels[0]?.size ?? { width: 32, height: 32 };
  const gameLevel = gameDefinition.createEmptyLevel(size);

  const levels = baseLevelset.levels.slice();
  const index =
    insertIndex !== undefined ? Math.min(Math.max(insertIndex, 0), levels.length) : levels.length;

  const newLevelWL: LevelWithLayers<TCell> = {
    id: gameLevel.id as LevelId,
    name: gameLevel.name,
    size: gameLevel.size,
    meta: gameLevel.meta,
    layers: [
      {
        id: 'layer-background',
        name: 'Background',
        visible: true,
        grid: gameLevel.grid.map((cell) => cell),
      },
    ],
    activeLayerId: 'layer-background',
  };

  levels.splice(index, 0, newLevelWL);

  return {
    ...state,
    levelset: {
      ...state.levelset,
      levels,
    },
    currentLevelId: newLevelWL.id,
  };
}

function deleteLevel<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  levelId: LevelId,
): EditorState<TCell> {
  const idx = findLevelIndex(state, levelId);
  const levels = state.levelset.levels.slice();
  levels.splice(idx, 1);

  if (levels.length === 0) {
    // Do not allow deleting the last level; no-op.
    return state;
  }

  const newCurrentIdx = Math.min(idx, levels.length - 1);
  const newCurrentId = levels[newCurrentIdx].id;

  return {
    ...state,
    levelset: {
      ...state.levelset,
      levels,
    },
    currentLevelId: newCurrentId,
  };
}

function reorderLevel<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  levelId: LevelId,
  newIndex: number,
): EditorState<TCell> {
  const levels = state.levelset.levels.slice();
  const currentIndex = levels.findIndex((lvl) => lvl.id === levelId);
  if (currentIndex === -1) return state;

  const clamped = Math.min(Math.max(newIndex, 0), levels.length - 1);

  const [lvl] = levels.splice(currentIndex, 1);
  levels.splice(clamped, 0, lvl);

  return {
    ...state,
    levelset: {
      ...state.levelset,
      levels,
    },
    currentLevelId: state.currentLevelId === levelId ? levelId : state.currentLevelId,
  };
}

function applyAddLayer<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: AddLayerCommand,
): EditorState<TCell> {
  return updateLevelAt(state, cmd.levelId, (lvl) => addLayer(lvl, cmd.name, cmd.index));
}

function applyRemoveLayer<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: RemoveLayerCommand,
): EditorState<TCell> {
  return updateLevelAt(state, cmd.levelId, (lvl) => removeLayer(lvl, cmd.layerId));
}

function applyReorderLayer<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: ReorderLayerCommand,
): EditorState<TCell> {
  return updateLevelAt(state, cmd.levelId, (lvl) => reorderLayer(lvl, cmd.layerId, cmd.newIndex));
}

function applyNewLayerFromSelection<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: NewLayerFromSelectionCommand,
): EditorState<TCell> {
  if (!state.selection) return state;

  return updateLevelAt(state, cmd.levelId, (lvl) =>
    newLayerFromSelection(
      lvl,
      state.selection!, // selection rect
      cmd.sourceLayerId,
      cmd.newLayerName,
    ),
  );
}

function setSelection<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  selection: SelectionRect | null,
): EditorState<TCell> {
  return {
    ...state,
    selection,
  };
}

function clearSelection<TCell extends GameCellBase>(state: EditorState<TCell>): EditorState<TCell> {
  return setSelection(state, null);
}

function applySetLayerVisibility<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: SetLayerVisibilityCommand,
): EditorState<TCell> {
  return updateLevelAt(state, cmd.levelId, (lvl) =>
    setLayerVisibility(lvl, cmd.layerId, cmd.visible),
  );
}

function applySetActiveLayer<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: SetActiveLayerCommand,
): EditorState<TCell> {
  return updateLevelAt(state, cmd.levelId, (lvl) => {
    // Ensure layer exists
    const exists = lvl.layers.some((l) => l.id === cmd.layerId);
    if (!exists) return lvl;
    return {
      ...lvl,
      activeLayerId: cmd.layerId,
    };
  });
}

function applyRenameLayer<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  cmd: RenameLayerCommand,
): EditorState<TCell> {
  return updateLevelAt(state, cmd.levelId, (lvl) => {
    const layers = lvl.layers.map((layer) =>
      layer.id === cmd.layerId ? { ...layer, name: cmd.name } : layer,
    );
    return { ...lvl, layers };
  });
}

function reduceEditorState<TCell extends GameCellBase>(
  state: EditorState<TCell>,
  command: EditorCommand,
  gameDefinition: GameDefinition<TCell>,
): EditorState<TCell> {
  switch (command.type) {
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeToolId: command.toolId };

    case 'SET_SELECTION':
      return setSelection(state, command.selection);

    case 'CLEAR_SELECTION':
      return clearSelection(state);

    case 'PAINT_STROKE':
      return paintStroke(state, command, gameDefinition);

    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevelId: command.levelId };

    case 'ADD_LEVEL':
      return addLevel(state, gameDefinition, command.insertIndex);

    case 'DELETE_LEVEL':
      return deleteLevel(state, command.levelId);

    case 'REORDER_LEVEL':
      return reorderLevel(state, command.levelId, command.newIndex);

    case 'ADD_LAYER':
      return applyAddLayer(state, command);

    case 'REMOVE_LAYER':
      return applyRemoveLayer(state, command);

    case 'REORDER_LAYER':
      return applyReorderLayer(state, command);

    case 'NEW_LAYER_FROM_SELECTION':
      return applyNewLayerFromSelection(state, command);

    case 'SET_LAYER_VISIBILITY':
      return applySetLayerVisibility(state, command);

    case 'SET_ACTIVE_LAYER':
      return applySetActiveLayer(state, command);

    case 'RENAME_LAYER':
      return applyRenameLayer(state, command);

    default:
      // Unknown command type: no-op
      return state;
  }
}

export function applyEditorCommand<TCell extends GameCellBase>(
  history: EditorHistory<TCell>,
  command: EditorCommand,
  gameDefinition: GameDefinition<TCell>,
): EditorHistory<TCell> {
  const current = history.present;
  const next = reduceEditorState(current, command, gameDefinition);

  // If nothing changed, we can skip pushing history
  if (next === current) {
    return history;
  }

  return {
    past: [...history.past, current],
    present: next,
    future: [],
  };
}

export function undo<TCell extends GameCellBase>(
  history: EditorHistory<TCell>,
): EditorHistory<TCell> {
  if (history.past.length === 0) {
    return history;
  }

  const past = history.past.slice();
  const previous = past.pop()!;
  const future = [history.present, ...history.future];

  return {
    past,
    present: previous,
    future,
  };
}

export function redo<TCell extends GameCellBase>(
  history: EditorHistory<TCell>,
): EditorHistory<TCell> {
  if (history.future.length === 0) {
    return history;
  }

  const [next, ...restFuture] = history.future;

  return {
    past: [...history.past, history.present],
    present: next,
    future: restFuture,
  };
}
