// frontend/src/core/plugin/cc1/datFileFormat.ts

import type { FileFormatDescriptor, LevelsetWithLayers } from '../fileFormatTypes';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import { parseDat, encodeDat } from '../../game/cc1/cc1DatCodec';
import { createGrid } from '../../model/grid';
import type { LevelWithLayers } from '../../model/layers';
import type { Size } from '../../model/types';
import type { GameLevelset } from '../../model/gameTypes';
import type { GameDefinition } from '../../game/gameDefinition';

/**
 * Wrap a GameLevelset<CC1Cell> into LevelsetWithLayers<CC1Cell>
 * by creating a single background layer per level.
 */
function wrapLevelsWithLayers(levelset: GameLevelset<CC1Cell>): LevelsetWithLayers<CC1Cell> {
  const levelsWithLayers: LevelWithLayers<CC1Cell>[] = levelset.levels.map((lvl) => {
    const size: Size = lvl.size;

    const bgGrid = createGrid<CC1Cell | null>(size, ({ x, y }) => lvl.grid.get({ x, y }));

    return {
      id: lvl.id,
      name: lvl.name,
      size,
      meta: lvl.meta,
      layers: [
        {
          id: 'layer-background',
          name: 'Background',
          visible: true,
          grid: bgGrid,
        },
      ],
      activeLayerId: 'layer-background',
    };
  });

  return {
    id: levelset.id,
    name: levelset.name,
    gameId: 'cc1',
    levels: levelsWithLayers,
  };
}

export function cc1DatFileFormat(
  gameDefinition: GameDefinition<CC1Cell>,
): FileFormatDescriptor<CC1Cell> {
  return {
    id: 'file.cc1_dat',
    displayName: 'CC1 DAT',
    filenameExtensions: ['.dat'],
    gameId: 'cc1',
    canRead: true,
    canWrite: true,

    async read(data: ArrayBuffer): Promise<LevelsetWithLayers<CC1Cell>> {
      const levelset = parseDat(data);
      return wrapLevelsWithLayers(levelset);
    },

    async write(levelsetWithLayers: LevelsetWithLayers<CC1Cell>): Promise<ArrayBuffer> {
      // Flatten each LevelWithLayers via GameDefinition before encoding
      const gameLevelset: GameLevelset<CC1Cell> = {
        id: levelsetWithLayers.id,
        name: levelsetWithLayers.name,
        gameId: 'cc1',
        levels: levelsetWithLayers.levels.map((lvl) => gameDefinition.flattenLevelWithLayers(lvl)),
      };

      return encodeDat(gameLevelset);
    },
  };
}
