// frontend/src/core/model/types.ts

// 0-based grid coordinates
export interface Coords {
  x: number; // column
  y: number; // row
}

// Dimensions in cells
export interface Size {
  width: number;
  height: number;
}

// Identifiers used throughout the model
export type LevelId = string; // e.g. "level-1"
export type LayerId = string; // e.g. "layer-background"
export type LevelsetId = string; // e.g. "levelset-cc1-main"
