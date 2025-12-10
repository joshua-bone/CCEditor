// frontend/src/core/game/cc1/__tests__/cc1DatCodec.test.ts

import { describe, it, expect } from 'vitest';
import { encodeDat, parseDat } from '../cc1DatCodec';
import { CC1TileId } from '../cc1Tiles';
import { createGrid } from '../../../model/grid';
import type { CC1Cell } from '../cc1Types';
import type { GameLevel, GameLevelset } from '../../../model/gameTypes';

describe('cc1DatCodec', () => {
  it('round-trips a simple levelset', () => {
    const size = { width: 32, height: 32 };

    const grid = createGrid<CC1Cell>(size, () => ({
      gameId: 'cc1',
      top: CC1TileId.FLOOR,
      bottom: CC1TileId.FLOOR,
    }));

    const level: GameLevel<CC1Cell> = {
      id: 'lvl-1',
      name: 'Test Level',
      size,
      meta: { timeLimitSeconds: 100, requiredChips: 1, extra: {} },
      grid,
    };

    const levelset: GameLevelset<CC1Cell> = {
      id: 'set-1',
      name: 'Test Set',
      gameId: 'cc1',
      levels: [level],
    };

    const buffer = encodeDat(levelset);
    const decoded = parseDat(buffer);

    expect(decoded.levels).toHaveLength(1);
    const decodedLevel = decoded.levels[0];
    expect(decodedLevel.size).toEqual(size);
    expect(decodedLevel.meta.timeLimitSeconds).toBe(100);

    const decodedCell = decodedLevel.grid.get({ x: 0, y: 0 });
    expect(decodedCell.top).toBe(CC1TileId.FLOOR);
    expect(decodedCell.bottom).toBe(CC1TileId.FLOOR);
  });
});
