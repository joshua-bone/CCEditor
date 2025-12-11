// frontend/src/core/game/gameDefinition.ts

import type { Size } from '../model/types';
import type { GameCellBase, GameLevel, GameLevelset } from '../model/gameTypes';
import type { LevelWithLayers } from '../model/layers';
import type { Coords } from '../model/types';

export interface ValidationIssue {
  levelId: string;
  coords?: Coords;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface TileDescriptor {
  id: string; // palette ID, e.g. "floor"
  label: string; // human-readable name
  category?: string; // e.g. "terrain", "item", "monster"
  cc1Id?: number | string; // optional: link to CC1TileId
  symbol?: string; // OPTIONAL: "·", "#", "@" – simple text icon
}

export interface GameDefinition<TCell extends GameCellBase> {
  readonly gameId: TCell['gameId'];
  readonly name: string;

  // Creation
  createEmptyCell(): TCell;
  createEmptyLevel(size: Size): GameLevel<TCell>;

  // Levelset creation helper (minimal: single empty level)
  createEmptyLevelset(size: Size): GameLevelset<TCell>;

  // Layer composition
  flattenLevelWithLayers(level: LevelWithLayers<TCell>): GameLevel<TCell>;

  // Semantics-aware painting
  applyNormalPaint(cell: TCell, tileId: string, button: 'left' | 'right'): TCell;

  applyBuryPaint(cell: TCell, tileId: string): TCell;

  // Validation
  validateLevel(level: GameLevel<TCell>): ValidationIssue[];

  // Palette
  getTilePalette(): TileDescriptor[];

  /**
   * Optional hook for game-specific monster-order updates.
   * For CC1:
   * - Called after a cell paint at coords with newCell.
   * - Returns a new LevelWithLayers with movement list adjusted.
   */
  updateMonsterOrder?(
    level: LevelWithLayers<TCell>,
    coords: Coords,
    newCell: TCell,
  ): LevelWithLayers<TCell>;
}
