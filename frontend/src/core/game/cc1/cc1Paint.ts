import type { CC1Cell } from './cc1Types';
import { CC1TileId, type CC1TileName } from './cc1Tiles';
import { isCC1Mob, isCC1Monster } from './cc1TileGroups';
import type { GameLevel, MonsterIndex } from '../../model/gameTypes';
import type { Coords } from '../../model/types';

function normalizeCell(cell: CC1Cell): CC1Cell {
  return {
    gameId: 'cc1',
    top: cell.top ?? CC1TileId.FLOOR,
    bottom: cell.bottom ?? CC1TileId.FLOOR,
  };
}

export function cc1NormalPaint(cell: CC1Cell, tileName: CC1TileName): CC1Cell {
  const base = normalizeCell(cell);
  const elem = CC1TileId[tileName];

  const isMob = isCC1Mob(elem);
  const mobHere = isCC1Mob(base.top ?? CC1TileId.FLOOR);

  if (isMob) {
    if (!mobHere) {
      // Move current top terrain/item to bottom.
      return {
        gameId: 'cc1',
        top: elem,
        bottom: base.top,
      };
    }
    // Replace mob on top, keep terrain.
    return {
      gameId: 'cc1',
      top: elem,
      bottom: base.bottom,
    };
  }

  // elem is non-mob
  if (mobHere) {
    // Add terrain under existing mob.
    return {
      gameId: 'cc1',
      top: base.top,
      bottom: elem,
    };
  }

  // No mob: just put elem on top.
  return {
    gameId: 'cc1',
    top: elem,
    bottom: base.bottom,
  };
}

export function cc1BuryPaint(cell: CC1Cell, tileName: CC1TileName): CC1Cell {
  const base = normalizeCell(cell);
  const elem = CC1TileId[tileName];

  // For v1, bury = raw overwrite of bottom, keep top.
  return {
    gameId: 'cc1',
    top: base.top,
    bottom: elem,
  };
}

export function updateMonsterOrderOnPaint(
  oldLevel: GameLevel<CC1Cell>,
  newLevel: GameLevel<CC1Cell>,
  coords: Coords,
): MonsterIndex[] {
  const extraOld = oldLevel.meta.extra as { movement?: MonsterIndex[] } | undefined;

  const oldMovement = (extraOld?.movement ?? []).slice();
  const newMovement = oldMovement;

  const index = coords.y * oldLevel.size.width + coords.x;

  const oldCell = oldLevel.grid.get(coords);
  const newCell = newLevel.grid.get(coords);

  const wasMonster = isCC1Monster(oldCell.top) || isCC1Monster(oldCell.bottom);
  const isMonster = isCC1Monster(newCell.top) || isCC1Monster(newCell.bottom);

  // Removal: monster erased at this index.
  if (wasMonster && !isMonster) {
    const idx = newMovement.indexOf(index);
    if (idx !== -1) {
      newMovement.splice(idx, 1);
    }
  }

  // Addition: new monster appears at this index.
  if (!wasMonster && isMonster && newMovement.length < 127) {
    newMovement.push(index);
  }

  return newMovement;
}
