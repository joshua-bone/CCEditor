// frontend/src/core/app/editorState.ts

import type { GameCellBase } from '../model/gameTypes';
import type { LevelWithLayers } from '../model/layers';
import type { SelectionRect } from '../model/selection';
import type { LayerClipboard } from '../model/clipboard';
import type { Coords, LevelId, LevelsetId } from '../model/types';
import type { GameDefinition } from '../game/gameDefinition';
import type { LevelsetWithLayers } from '../plugin/fileFormatTypes';
import { createGrid } from '../model/grid';

export interface PaletteSelection {
  leftTileId: string | null;
  rightTileId: string | null;
}

export interface ViewState {
  zoom: number; // 1.0 = 100%
  pan: Coords; // in cell-space (or later pixels)
  overlaysEnabled: Record<string, boolean>; // overlayId -> enabled
}

export interface EditorState<TCell extends GameCellBase = GameCellBase> {
  readonly projectId: string;
  readonly gameId: TCell['gameId'];

  readonly levelset: LevelsetWithLayers<TCell>;
  readonly currentLevelId: LevelId;

  readonly selection: SelectionRect | null;
  readonly clipboard: LayerClipboard<TCell> | null;
  readonly paletteSelection: PaletteSelection;
  readonly viewState: ViewState;

  readonly activeToolId: string | null;
}

/**
 * Internal helper: wrap a GameLevel into a LevelWithLayers with a single background layer.
 */
function levelToLevelWithLayers<TCell extends GameCellBase>(
  _gameDefinition: GameDefinition<TCell>,
  gameLevel: ReturnType<GameDefinition<TCell>['createEmptyLevel']>,
): LevelWithLayers<TCell> {
  const size = gameLevel.size;

  const bgGrid = createGrid<TCell | null>(size, ({ x, y }) => gameLevel.grid.get({ x, y }));

  const backgroundLayerId: string = 'layer-background';

  return {
    id: gameLevel.id as LevelId,
    name: gameLevel.name,
    size,
    meta: gameLevel.meta,
    layers: [
      {
        id: backgroundLayerId,
        name: 'Background',
        visible: true,
        grid: bgGrid,
      },
    ],
    activeLayerId: backgroundLayerId,
  };
}

/**
 * Create a new CC1 (or other game) project with a single blank levelset and level.
 */
export function createInitialEditorState<TCell extends GameCellBase>(
  gameDefinition: GameDefinition<TCell>,
): EditorState<TCell> {
  const defaultSize = { width: 32, height: 32 }; // reasonable default; can change later
  const levelsetBase = gameDefinition.createEmptyLevelset(defaultSize);

  const levelsWithLayers: LevelWithLayers<TCell>[] = levelsetBase.levels.map((lvl) =>
    levelToLevelWithLayers(gameDefinition, lvl),
  );

  const levelset: LevelsetWithLayers<TCell> = {
    id: levelsetBase.id as LevelsetId,
    name: levelsetBase.name,
    gameId: levelsetBase.gameId as TCell['gameId'],
    levels: levelsWithLayers,
  };

  const currentLevelId: LevelId = levelset.levels[0].id;

  // Palette defaults: use first palette entry if available
  const palette = gameDefinition.getTilePalette();
  const leftTileId = palette[0]?.id ?? null;
  const rightTileId = palette[1]?.id ?? leftTileId ?? null;

  const paletteSelection: PaletteSelection = {
    leftTileId,
    rightTileId,
  };

  const viewState: ViewState = {
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    overlaysEnabled: {},
  };

  const projectId = `project-${Date.now()}`;

  const defaultToolId = 'tool.brush';

  return {
    projectId,
    gameId: levelset.gameId,
    levelset,
    currentLevelId,
    selection: null,
    clipboard: null,
    paletteSelection,
    viewState,
    activeToolId: defaultToolId,
  };
}

export function createEditorStateFromLevelset<TCell extends GameCellBase>(
  gameDefinition: GameDefinition<TCell>,
  levelset: LevelsetWithLayers<TCell>,
): EditorState<TCell> {
  const projectId = `project-${Date.now()}`;

  // We assume levelset already has LevelWithLayers<TCell> objects;
  // just wrap it into EditorState and reinitialize palette/view state.
  const initialLevelId = levelset.levels[0]?.id;

  const palette = gameDefinition.getTilePalette();
  const leftTileId = palette[0]?.id ?? null;
  const rightTileId = palette[1]?.id ?? leftTileId ?? null;

  return {
    projectId,
    gameId: levelset.gameId,
    levelset,
    currentLevelId: initialLevelId ?? '',
    selection: null,
    clipboard: null,
    paletteSelection: {
      leftTileId,
      rightTileId,
    },
    viewState: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      overlaysEnabled: {},
    },
    activeToolId: 'tool.brush',
  };
}
