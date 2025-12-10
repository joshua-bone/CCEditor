// frontend/src/core/game/cc1/cc1Types.ts

import type {
  GameCellBase,
  GameLevelMetadata,
  GameLevel,
  GameLevelset,
} from '../../model/gameTypes';
import type { CC1TileId } from './cc1Tiles';

export interface CC1Cell extends GameCellBase {
  gameId: 'cc1';
  bottom: CC1TileId | null;
  top: CC1TileId | null;
}

export interface CC1LevelMetadata extends GameLevelMetadata {
  password?: string;
  hintText?: string;
  // timeLimitSeconds / requiredChips are inherited from GameLevelMetadata
}

export type CC1Level = GameLevel<CC1Cell>;
export type CC1Levelset = GameLevelset<CC1Cell>;
