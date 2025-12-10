// frontend/src/core/model/gameTypes.ts

import type { LevelId, LevelsetId, Size } from './types';
import type { Grid } from './grid';

// Base cell type that game-specific cells extend.
export interface GameCellBase {
  gameId: 'cc1' | 'cc2'; // can expand later if needed
}

// Game-agnostic metadata; games can extend via `extra`.
export interface GameLevelMetadata {
  title?: string;
  author?: string;
  comment?: string;

  timeLimitSeconds?: number;
  requiredChips?: number;

  extra?: Record<string, unknown>;
}

// We'll use these in TS06, but it's convenient to shape them now.
export interface GameLevel<TCell extends GameCellBase> {
  id: LevelId;
  name: string;
  size: Size;
  grid: Grid<TCell>;
  meta: GameLevelMetadata;
}

export interface GameLevelset<TCell extends GameCellBase> {
  id: LevelsetId;
  name: string;
  gameId: 'cc1' | 'cc2';
  levels: GameLevel<TCell>[];
}
