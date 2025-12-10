// frontend/src/core/game/cc1/cc1TileGroups.ts

import { CC1TileId } from './cc1Tiles';
import type { CC1TileId as CC1TileIdType } from './cc1Tiles';

const C = CC1TileId;

// Helper: {PREFIX}_N, {PREFIX}_E, {PREFIX}_S, {PREFIX}_W
function compass(
  prefix:
    | 'FORCE'
    | 'PANEL'
    | 'CLONE_BLOCK'
    | 'PLAYER'
    | 'ANT'
    | 'PARAMECIUM'
    | 'GLIDER'
    | 'FIREBALL'
    | 'TANK'
    | 'BALL'
    | 'WALKER'
    | 'TEETH'
    | 'BLOB',
): ReadonlySet<CC1TileIdType> {
  return new Set<CC1TileIdType>([
    C[`${prefix}_N` as keyof typeof C] as CC1TileIdType,
    C[`${prefix}_E` as keyof typeof C] as CC1TileIdType,
    C[`${prefix}_S` as keyof typeof C] as CC1TileIdType,
    C[`${prefix}_W` as keyof typeof C] as CC1TileIdType,
  ]);
}

// All tiles
export const CC1_ALL_TILES: ReadonlySet<CC1TileIdType> = new Set(
  Object.values(CC1TileId) as CC1TileIdType[],
);

// Invalid tiles
export const CC1_INVALID_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.NOT_USED_0,
  C.DROWN_CHIP,
  C.BURNED_CHIP0,
  C.BURNED_CHIP1,
  C.NOT_USED_1,
  C.NOT_USED_2,
  C.NOT_USED_3,
  C.CHIP_EXIT,
  C.UNUSED_EXIT_0,
  C.UNUSED_EXIT_1,
  C.CHIP_SWIMMING_N,
  C.CHIP_SWIMMING_E,
  C.CHIP_SWIMMING_S,
  C.CHIP_SWIMMING_W,
]);

// Valid tiles = all - invalid
export const CC1_VALID_TILES: ReadonlySet<CC1TileIdType> = new Set(
  [...CC1_ALL_TILES].filter((t) => !CC1_INVALID_TILES.has(t)),
);

// Ice & force floors
export const CC1_ICE_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.ICE,
  C.ICE_NE,
  C.ICE_NW,
  C.ICE_SE,
  C.ICE_SW,
]);

export const CC1_FORCE_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.FORCE_RANDOM,
  ...compass('FORCE'),
]);

// Walls & panels
export const CC1_WALL_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.WALL,
  C.INV_WALL_PERM,
  C.INV_WALL_APP,
  C.BLUE_WALL_REAL,
]);

export const CC1_PANEL_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.PANEL_SE,
  ...compass('PANEL'),
]);

// Blocks
export const CC1_CLONE_BLOCK_TILES = compass('CLONE_BLOCK');

export const CC1_BLOCK_TILES: ReadonlySet<CC1TileIdType> = new Set([
  ...CC1_CLONE_BLOCK_TILES,
  C.BLOCK,
]);

// Player
export const CC1_PLAYER_TILES = compass('PLAYER');

// Individual monster families
export const CC1_ANT_TILES = compass('ANT');
export const CC1_PARAMECIUM_TILES = compass('PARAMECIUM');
export const CC1_GLIDER_TILES = compass('GLIDER');
export const CC1_FIREBALL_TILES = compass('FIREBALL');
export const CC1_TANK_TILES = compass('TANK');
export const CC1_BALL_TILES = compass('BALL');
export const CC1_WALKER_TILES = compass('WALKER');
export const CC1_TEETH_TILES = compass('TEETH');
export const CC1_BLOB_TILES = compass('BLOB');

// Monsters = union of all monster families
export const CC1_MONSTER_TILES: ReadonlySet<CC1TileIdType> = new Set([
  ...CC1_GLIDER_TILES,
  ...CC1_ANT_TILES,
  ...CC1_PARAMECIUM_TILES,
  ...CC1_FIREBALL_TILES,
  ...CC1_TEETH_TILES,
  ...CC1_TANK_TILES,
  ...CC1_BLOB_TILES,
  ...CC1_WALKER_TILES,
  ...CC1_BALL_TILES,
]);

// Mobs = monsters + blocks + players
export const CC1_MOB_TILES: ReadonlySet<CC1TileIdType> = new Set([
  ...CC1_MONSTER_TILES,
  ...CC1_BLOCK_TILES,
  ...CC1_PLAYER_TILES,
]);

// Non-mobs = everything else
export const CC1_NONMOB_TILES: ReadonlySet<CC1TileIdType> = new Set(
  [...CC1_ALL_TILES].filter((t) => !CC1_MOB_TILES.has(t)),
);

// Doors, keys, boots, pickups
export const CC1_DOOR_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.RED_DOOR,
  C.GREEN_DOOR,
  C.YELLOW_DOOR,
  C.BLUE_DOOR,
]);

export const CC1_KEY_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.RED_KEY,
  C.GREEN_KEY,
  C.YELLOW_KEY,
  C.BLUE_KEY,
]);

export const CC1_BOOT_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.SKATES,
  C.SUCTION_BOOTS,
  C.FIRE_BOOTS,
  C.FLIPPERS,
]);

export const CC1_PICKUP_TILES: ReadonlySet<CC1TileIdType> = new Set([
  ...CC1_BOOT_TILES,
  ...CC1_KEY_TILES,
  C.CHIP,
]);

// Buttons & toggles
export const CC1_BUTTON_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.GREEN_BUTTON,
  C.TRAP_BUTTON,
  C.CLONE_BUTTON,
  C.TANK_BUTTON,
]);

export const CC1_TOGGLE_TILES: ReadonlySet<CC1TileIdType> = new Set([
  C.TOGGLE_WALL,
  C.TOGGLE_FLOOR,
]);

// --- Convenience predicates -------------------------------------------------
export const isCC1Tile = (t: CC1TileIdType): boolean => CC1_ALL_TILES.has(t);
export const isCC1ValidTile = (t: CC1TileIdType): boolean => CC1_VALID_TILES.has(t);
export const isCC1InvalidTile = (t: CC1TileIdType): boolean => CC1_INVALID_TILES.has(t);
export const isCC1Ice = (t: CC1TileIdType): boolean => CC1_ICE_TILES.has(t);
export const isCC1ForceFloor = (t: CC1TileIdType): boolean => CC1_FORCE_TILES.has(t);
export const isCC1Wall = (t: CC1TileIdType): boolean => CC1_WALL_TILES.has(t);
export const isCC1Panel = (t: CC1TileIdType): boolean => CC1_PANEL_TILES.has(t);
export const isCC1CloneBlock = (t: CC1TileIdType): boolean => CC1_CLONE_BLOCK_TILES.has(t);
export const isCC1Block = (t: CC1TileIdType): boolean => CC1_BLOCK_TILES.has(t);
export const isCC1Player = (t: CC1TileIdType): boolean => CC1_PLAYER_TILES.has(t);
export const isCC1Ant = (t: CC1TileIdType): boolean => CC1_ANT_TILES.has(t);
export const isCC1Paramecium = (t: CC1TileIdType): boolean => CC1_PARAMECIUM_TILES.has(t);
export const isCC1Glider = (t: CC1TileIdType): boolean => CC1_GLIDER_TILES.has(t);
export const isCC1Fireball = (t: CC1TileIdType): boolean => CC1_FIREBALL_TILES.has(t);
export const isCC1Tank = (t: CC1TileIdType): boolean => CC1_TANK_TILES.has(t);
export const isCC1Ball = (t: CC1TileIdType): boolean => CC1_BALL_TILES.has(t);
export const isCC1Walker = (t: CC1TileIdType): boolean => CC1_WALKER_TILES.has(t);
export const isCC1Teeth = (t: CC1TileIdType): boolean => CC1_TEETH_TILES.has(t);
export const isCC1Blob = (t: CC1TileIdType): boolean => CC1_BLOB_TILES.has(t);
export const isCC1Monster = (t: CC1TileIdType): boolean => CC1_MONSTER_TILES.has(t);
export const isCC1Mob = (t: CC1TileIdType): boolean => CC1_MOB_TILES.has(t);
export const isCC1NonMob = (t: CC1TileIdType): boolean => CC1_NONMOB_TILES.has(t);
export const isCC1Door = (t: CC1TileIdType): boolean => CC1_DOOR_TILES.has(t);
export const isCC1Key = (t: CC1TileIdType): boolean => CC1_KEY_TILES.has(t);
export const isCC1Boot = (t: CC1TileIdType): boolean => CC1_BOOT_TILES.has(t);
export const isCC1Pickup = (t: CC1TileIdType): boolean => CC1_PICKUP_TILES.has(t);
export const isCC1Button = (t: CC1TileIdType): boolean => CC1_BUTTON_TILES.has(t);
export const isCC1Toggle = (t: CC1TileIdType): boolean => CC1_TOGGLE_TILES.has(t);
