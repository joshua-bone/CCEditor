// frontend/src/core/game/cc1/cc1GameDefinition.ts

import { createGrid } from '../../model/grid';
import type { Size, Coords } from '../../model/types';
import type { LevelWithLayers } from '../../model/layers';
import type { GameLevel, GameLevelset } from '../../model/gameTypes';
import type { GameDefinition, TileDescriptor, ValidationIssue } from '../gameDefinition';

import { CC1TileId } from './cc1Tiles';
import type { CC1TileId as CC1TileIdType, CC1TileName } from './cc1Tiles';
import type { CC1Cell, CC1Level, CC1Levelset } from './cc1Types';

import { CC1_INVALID_TILES, isCC1Mob } from './cc1TileGroups';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tileNameToId(name: string): CC1TileIdType | undefined {
  // Expect palette IDs like "FLOOR", "WALL", "PLAYER_N", etc.
  if (Object.prototype.hasOwnProperty.call(CC1TileId, name)) {
    return CC1TileId[name as CC1TileName] as CC1TileIdType;
  }
  return undefined;
}

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

// Python CC1Cell.add(elem) translated to immutable function
function addTileToCell(cell: CC1Cell, elem: CC1TileIdType): CC1Cell {
  const top = asConcreteTile(cell.top);
  const isMob = isCC1Mob(elem);
  const mobHere = isCC1Mob(top);

  if (isMob) {
    // If adding mob to terrain, move terrain to the bottom layer.
    if (!mobHere) {
      return {
        ...cell,
        bottom: top,
        top: elem,
      };
    }
    // Mob already here: replace mob, preserve terrain (bottom).
    return {
      ...cell,
      top: elem,
    };
  }

  // elem is terrain/other, not a mob.
  if (mobHere) {
    // If adding terrain where a mob exists, replace the terrain but not the mob.
    return {
      ...cell,
      top,
      bottom: elem,
    };
  }

  // No mob here; just place elem on top.
  return {
    ...cell,
    top: elem,
  };
}

// "Bury" write: raw write to bottom, leaving top untouched.
// This is intentionally allowed to create invalid combinations.
function buryTileInCell(cell: CC1Cell, elem: CC1TileIdType): CC1Cell {
  return {
    ...cell,
    bottom: elem,
  };
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
  // Minimal, structured palette for now; expand later as needed.
  return [
    { id: 'FLOOR', label: 'Floor', category: 'terrain', cc1Id: CC1TileId.FLOOR },
    { id: 'WALL', label: 'Wall', category: 'terrain', cc1Id: CC1TileId.WALL },
    { id: 'WATER', label: 'Water', category: 'terrain', cc1Id: CC1TileId.WATER },
    { id: 'FIRE', label: 'Fire', category: 'terrain', cc1Id: CC1TileId.FIRE },

    { id: 'CHIP', label: 'Chip', category: 'collectible', cc1Id: CC1TileId.CHIP },

    { id: 'PLAYER_N', label: 'Player (N)', category: 'player', cc1Id: CC1TileId.PLAYER_N },

    { id: 'BLOCK', label: 'Block', category: 'block', cc1Id: CC1TileId.BLOCK },

    { id: 'BLUE_DOOR', label: 'Blue Door', category: 'door', cc1Id: CC1TileId.BLUE_DOOR },
    { id: 'RED_DOOR', label: 'Red Door', category: 'door', cc1Id: CC1TileId.RED_DOOR },
    { id: 'GREEN_DOOR', label: 'Green Door', category: 'door', cc1Id: CC1TileId.GREEN_DOOR },
    { id: 'YELLOW_DOOR', label: 'Yellow Door', category: 'door', cc1Id: CC1TileId.YELLOW_DOOR },

    { id: 'BLUE_KEY', label: 'Blue Key', category: 'key', cc1Id: CC1TileId.BLUE_KEY },
    { id: 'RED_KEY', label: 'Red Key', category: 'key', cc1Id: CC1TileId.RED_KEY },
    { id: 'GREEN_KEY', label: 'Green Key', category: 'key', cc1Id: CC1TileId.GREEN_KEY },
    { id: 'YELLOW_KEY', label: 'Yellow Key', category: 'key', cc1Id: CC1TileId.YELLOW_KEY },

    { id: 'FLIPPERS', label: 'Flippers', category: 'boots', cc1Id: CC1TileId.FLIPPERS },
    { id: 'FIRE_BOOTS', label: 'Fire Boots', category: 'boots', cc1Id: CC1TileId.FIRE_BOOTS },
    { id: 'SKATES', label: 'Skates', category: 'boots', cc1Id: CC1TileId.SKATES },
    {
      id: 'SUCTION_BOOTS',
      label: 'Suction Boots',
      category: 'boots',
      cc1Id: CC1TileId.SUCTION_BOOTS,
    },
  ];
}

// ---------------------------------------------------------------------------
// GameDefinition implementation
// ---------------------------------------------------------------------------

function applyNormalPaintCC1(cell: CC1Cell, tileName: string): CC1Cell {
  const tile = tileNameToId(tileName);
  if (tile === undefined) {
    // Unknown tile ID: no-op
    return cell;
  }
  return addTileToCell(cell, tile);
}

function applyBuryPaintCC1(cell: CC1Cell, tileName: string): CC1Cell {
  const tile = tileNameToId(tileName);
  if (tile === undefined) {
    return cell;
  }
  return buryTileInCell(cell, tile);
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
  };

  return def;
}
