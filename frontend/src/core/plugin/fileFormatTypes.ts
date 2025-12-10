// frontend/src/core/plugin/fileFormatTypes.ts

import type { GameCellBase } from '../model/gameTypes';
import type { LevelWithLayers } from '../model/layers';
import type { LevelsetId } from '../model/types';

export interface LevelsetWithLayers<TCell extends GameCellBase = GameCellBase> {
  id: LevelsetId;
  name: string;
  gameId: TCell['gameId'];
  levels: LevelWithLayers<TCell>[];
}

export interface FileFormatDescriptor<TCell extends GameCellBase = GameCellBase> {
  id: string; // "file.datlayers_json", "file.cc1_dat"
  displayName: string; // "DAT Layers JSON", "CC1 DAT"
  filenameExtensions: string[]; // [".datlayers.json"], [".dat"]

  gameId?: TCell['gameId'] | 'any';

  canRead: boolean;
  canWrite: boolean;

  /**
   * Parse raw data into a levelset-with-layers.
   * For text formats, data will be string; for binary, ArrayBuffer.
   */
  read?(data: ArrayBuffer | string): Promise<LevelsetWithLayers<TCell>>;

  /**
   * Serialize a levelset-with-layers to raw data for download/export.
   */
  write?(levelset: LevelsetWithLayers<TCell>): Promise<ArrayBuffer | string>;
}
