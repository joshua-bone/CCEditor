// frontend/src/core/plugin/json/datLayersJsonTypes.ts

export interface DatLayersProjectJson {
  schemaVersion: 1;
  project: {
    id: string;
    name: string;
    gameId: 'cc1';
    meta?: Record<string, unknown>;
  };
  levels: DatLayersLevelJson[];
}

export interface DatLayersSizeJson {
  width: number;
  height: number;
}

export interface DatLayersCC1CellJson {
  top: string; // CC1TileName
  bottom: string; // CC1TileName
}

export type DatLayersCellJson = DatLayersCC1CellJson | null;

export interface DatLayersLayerJson {
  id: string;
  name: string;
  visible: boolean;
  grid: DatLayersCellJson[][];
}

export interface DatLayersLevelJson {
  id: string;
  name: string;
  size: DatLayersSizeJson;
  meta?: Record<string, unknown>;
  layers: DatLayersLayerJson[];
  activeLayerId: string;
}
