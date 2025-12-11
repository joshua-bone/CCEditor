// frontend/src/core/game/cc1/cc1GameDefinition.ts

import { createGrid } from '../../model/grid';
import type { Size, Coords } from '../../model/types';
import type { LevelWithLayers } from '../../model/layers';
import type { GameLevel, GameLevelMetadata, GameLevelset } from '../../model/gameTypes';
import type { GameDefinition, TileDescriptor, ValidationIssue } from '../gameDefinition';

import { CC1TileId } from './cc1Tiles';
import type { CC1TileId as CC1TileIdType, CC1TileName } from './cc1Tiles';
import type { CC1Cell, CC1Level, CC1Levelset } from './cc1Types';

import { CC1_INVALID_TILES, isCC1Mob, isCC1Monster } from './cc1TileGroups';
import { cc1BuryPaint, cc1NormalPaint } from './cc1Paint';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asConcreteTile(tile: CC1TileIdType | null): CC1TileIdType {
  // Treat null as FLOOR; mirrors Python default-ish behavior
  return tile ?? CC1TileId.FLOOR;
}

function createEmptyCC1Cell(): CC1Cell {
  return {
    gameId: 'cc1',
    top: CC1TileId.FLOOR,
    bottom: CC1TileId.FLOOR,
  };
}

function createEmptyCC1Level(size: Size): CC1Level {
  const grid = createGrid<CC1Cell>(size, () => createEmptyCC1Cell());
  return {
    id: 'level-1',
    name: 'Untitled',
    size,
    grid,
    meta: {},
  };
}

function createEmptyCC1Levelset(size: Size): CC1Levelset {
  return {
    id: 'levelset-cc1',
    name: 'CC1 Levelset',
    gameId: 'cc1',
    levels: [createEmptyCC1Level(size)],
  };
}

// Python CC1Cell.is_valid translated to pure function
function isValidCC1Cell(cell: CC1Cell): boolean {
  const top = asConcreteTile(cell.top);
  const bottom = asConcreteTile(cell.bottom);

  const buried = !isCC1Mob(top) && bottom !== CC1TileId.FLOOR;
  const invalidCode = CC1_INVALID_TILES.has(top) || CC1_INVALID_TILES.has(bottom);
  const buriedMob = isCC1Mob(bottom);

  return !(buried || invalidCode || buriedMob);
}

// ---------------------------------------------------------------------------
// Flattening layers → CC1Level
// ---------------------------------------------------------------------------

function flattenLevelWithLayersCC1(level: LevelWithLayers<CC1Cell>): CC1Level {
  const { size, meta, id, name } = level;

  const grid = createGrid<CC1Cell>(size, ({ x, y }) => {
    // Topmost non-null cell wins; if all null, use empty cell.
    for (let i = level.layers.length - 1; i >= 0; i--) {
      const cell = level.layers[i].grid.get({ x, y });
      if (cell !== null) {
        return cell;
      }
    }
    return createEmptyCC1Cell();
  });

  return {
    id,
    name,
    size,
    grid,
    meta,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateLevelCC1(level: CC1Level): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { size } = level;

  for (let y = 0; y < size.height; y++) {
    for (let x = 0; x < size.width; x++) {
      const coords: Coords = { x, y };
      const cell = level.grid.get(coords);
      if (!isValidCC1Cell(cell)) {
        issues.push({
          levelId: level.id,
          coords,
          severity: 'error',
          message: 'Invalid CC1 cell combination',
        });
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

function getCC1TilePalette(): TileDescriptor[] {
  return [
    // Terrain
    { id: 'FLOOR', label: 'Floor', category: 'terrain', cc1Id: CC1TileId.FLOOR, symbol: '·' },
    { id: 'WALL', label: 'Wall', category: 'terrain', cc1Id: CC1TileId.WALL, symbol: '#' },
    { id: 'WATER', label: 'Water', category: 'terrain', cc1Id: CC1TileId.WATER, symbol: '~' },
    { id: 'FIRE', label: 'Fire', category: 'terrain', cc1Id: CC1TileId.FIRE, symbol: '^' },
    { id: 'ICE', label: 'Ice', category: 'terrain', cc1Id: CC1TileId.ICE, symbol: 'I' },

    // Collectibles / exits
    { id: 'CHIP', label: 'Chip', category: 'collectible', cc1Id: CC1TileId.CHIP, symbol: '*' },
    { id: 'SOCKET', label: 'Socket', category: 'terrain', cc1Id: CC1TileId.SOCKET, symbol: '□' },
    { id: 'EXIT', label: 'Exit', category: 'terrain', cc1Id: CC1TileId.EXIT, symbol: '⎋' },

    // Player
    {
      id: 'PLAYER_N',
      label: 'Player (N)',
      category: 'player',
      cc1Id: CC1TileId.PLAYER_N,
      symbol: '@',
    },

    // Blocks
    { id: 'BLOCK', label: 'Block', category: 'block', cc1Id: CC1TileId.BLOCK, symbol: '□' },

    // Doors
    {
      id: 'BLUE_DOOR',
      label: 'Blue Door',
      category: 'door',
      cc1Id: CC1TileId.BLUE_DOOR,
      symbol: 'B',
    },
    { id: 'RED_DOOR', label: 'Red Door', category: 'door', cc1Id: CC1TileId.RED_DOOR, symbol: 'R' },
    {
      id: 'GREEN_DOOR',
      label: 'Green Door',
      category: 'door',
      cc1Id: CC1TileId.GREEN_DOOR,
      symbol: 'G',
    },
    {
      id: 'YELLOW_DOOR',
      label: 'Yellow Door',
      category: 'door',
      cc1Id: CC1TileId.YELLOW_DOOR,
      symbol: 'Y',
    },

    // Keys
    { id: 'BLUE_KEY', label: 'Blue Key', category: 'key', cc1Id: CC1TileId.BLUE_KEY, symbol: 'b' },
    { id: 'RED_KEY', label: 'Red Key', category: 'key', cc1Id: CC1TileId.RED_KEY, symbol: 'r' },
    {
      id: 'GREEN_KEY',
      label: 'Green Key',
      category: 'key',
      cc1Id: CC1TileId.GREEN_KEY,
      symbol: 'g',
    },
    {
      id: 'YELLOW_KEY',
      label: 'Yellow Key',
      category: 'key',
      cc1Id: CC1TileId.YELLOW_KEY,
      symbol: 'y',
    },

    // Boots
    {
      id: 'FLIPPERS',
      label: 'Flippers',
      category: 'boots',
      cc1Id: CC1TileId.FLIPPERS,
      symbol: 'F',
    },
    {
      id: 'FIRE_BOOTS',
      label: 'Fire Boots',
      category: 'boots',
      cc1Id: CC1TileId.FIRE_BOOTS,
      symbol: 'f',
    },
    { id: 'SKATES', label: 'Skates', category: 'boots', cc1Id: CC1TileId.SKATES, symbol: 'S' },
    {
      id: 'SUCTION_BOOTS',
      label: 'Suction Boots',
      category: 'boots',
      cc1Id: CC1TileId.SUCTION_BOOTS,
      symbol: 'U',
    },
  ];
}

// ---------------------------------------------------------------------------
// GameDefinition implementation
// ---------------------------------------------------------------------------

// inside createCC1GameDefinition
function applyNormalPaintCC1(cell: CC1Cell, tileId: string): CC1Cell {
  const name = tileId as CC1TileName;
  if (!(name in CC1TileId)) {
    return cell;
  }
  return cc1NormalPaint(cell, name);
}

function applyBuryPaintCC1(cell: CC1Cell, tileId: string): CC1Cell {
  const name = tileId as CC1TileName;
  if (!(name in CC1TileId)) {
    return cell;
  }
  return cc1BuryPaint(cell, name);
}

function updateMonsterOrderCC1(
  level: LevelWithLayers<CC1Cell>,
  coords: Coords,
  newCell: CC1Cell,
): LevelWithLayers<CC1Cell> {
  const width = level.size.width;
  const index = coords.y * width + coords.x;

  const extra = level.meta.extra as { movement?: number[] } | undefined;
  const oldMovement = extra?.movement ?? [];
  const movement = oldMovement.slice();

  const oldCell = level.layers[0].grid.get(coords) ?? {
    gameId: 'cc1',
    top: CC1TileId.FLOOR,
    bottom: CC1TileId.FLOOR,
  };
  const wasMonster = isCC1Monster(oldCell.top) || isCC1Monster(oldCell.bottom);
  const isMonster = isCC1Monster(newCell.top) || isCC1Monster(newCell.bottom);

  if (wasMonster && !isMonster) {
    const idx = movement.indexOf(index);
    if (idx !== -1) {
      movement.splice(idx, 1);
    }
  } else if (!wasMonster && isMonster && movement.length < 127) {
    movement.push(index);
  }

  const newMeta: GameLevelMetadata = {
    ...level.meta,
    extra: {
      ...(level.meta.extra ?? {}),
      movement,
    },
  };

  return {
    ...level,
    meta: newMeta,
  };
}

export function createCC1GameDefinition(): GameDefinition<CC1Cell> {
  const def: GameDefinition<CC1Cell> = {
    gameId: 'cc1',
    name: "Chip's Challenge 1",

    createEmptyCell: createEmptyCC1Cell,
    createEmptyLevel: (size: Size): GameLevel<CC1Cell> => createEmptyCC1Level(size),
    createEmptyLevelset: (size: Size): GameLevelset<CC1Cell> => createEmptyCC1Levelset(size),

    flattenLevelWithLayers: flattenLevelWithLayersCC1,

    applyNormalPaint: applyNormalPaintCC1,
    applyBuryPaint: applyBuryPaintCC1,

    validateLevel: validateLevelCC1,
    getTilePalette: getCC1TilePalette,
    updateMonsterOrder: updateMonsterOrderCC1,
  };

  return def;
}
