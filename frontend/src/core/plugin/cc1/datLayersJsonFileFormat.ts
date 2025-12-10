// frontend/src/core/plugin/json/datLayersJsonFileFormat.ts

import Ajv, { type JSONSchemaType } from 'ajv';

import schemaJson from '../../../schemas/datlayers.schema.json';
import type { FileFormatDescriptor, LevelsetWithLayers } from '../fileFormatTypes';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import { CC1TileId, cc1TileNameToId, cc1TileIdToName } from '../../game/cc1/cc1Tiles';
import type {
  DatLayersProjectJson,
  DatLayersLevelJson,
  DatLayersLayerJson,
  DatLayersCellJson,
} from './datLayersJsonTypes';
import type { Size } from '../../model/types';
import { createGrid } from '../../model/grid';
import type { Grid } from '../../model/grid';
import type { LevelWithLayers } from '../../model/layers';
import type { GameLevelMetadata } from '../../model/gameTypes';

// ---------------------------------------------------------------------------
// Ajv setup
// ---------------------------------------------------------------------------

const schemaTyped = schemaJson as unknown as JSONSchemaType<DatLayersProjectJson>;

const ajv = new Ajv({ allErrors: true, strict: false });

const validate = ajv.compile<DatLayersProjectJson>(schemaTyped);

function ensureValidProjectJson(data: unknown): DatLayersProjectJson {
  if (!validate(data)) {
    // Log all validation errors for debugging
    // (you can surface them via UI later).

    console.error('datlayers.json validation errors:', validate.errors);
    throw new Error('Invalid .datlayers.json format');
  }
  return data as DatLayersProjectJson;
}

// ---------------------------------------------------------------------------
// JSON → domain conversion
// ---------------------------------------------------------------------------

function cellFromJson(json: DatLayersCellJson): CC1Cell | null {
  if (json === null) {
    return null;
  }

  const topId = cc1TileNameToId(json.top);
  const bottomId = cc1TileNameToId(json.bottom);

  if (topId === null || bottomId === null) {
    // Unknown tiles → treat as FLOOR/FLOOR
    return {
      gameId: 'cc1',
      top: CC1TileId.FLOOR,
      bottom: CC1TileId.FLOOR,
    };
  }

  return {
    gameId: 'cc1',
    top: topId,
    bottom: bottomId,
  };
}

function layerFromJson(json: DatLayersLayerJson, size: Size) {
  const grid = createGrid<CC1Cell | null>(size, ({ x, y }) => {
    const row = json.grid[y];
    if (!row) {
      return null;
    }
    const cellJson: DatLayersCellJson = row[x] ?? null;
    return cellFromJson(cellJson);
  });

  return {
    id: json.id,
    name: json.name,
    visible: json.visible,
    grid,
  };
}

function levelFromJson(json: DatLayersLevelJson) {
  const size = json.size;
  const layers = json.layers.map((layerJson) => layerFromJson(layerJson, size));

  return {
    id: json.id,
    name: json.name,
    size,
    meta: json.meta ?? {},
    layers,
    activeLayerId: json.activeLayerId,
  };
}

function projectFromJson(json: DatLayersProjectJson): LevelsetWithLayers<CC1Cell> {
  const levels = json.levels.map(levelFromJson);

  return {
    id: json.project.id,
    name: json.project.name,
    gameId: 'cc1',
    levels,
  };
}

// ---------------------------------------------------------------------------
// Domain → JSON conversion
// ---------------------------------------------------------------------------

function cellToJson(cell: CC1Cell | null): DatLayersCellJson {
  if (cell === null) {
    return null;
  }

  return {
    top: cc1TileIdToName(cell.top ?? CC1TileId.FLOOR),
    bottom: cc1TileIdToName(cell.bottom ?? CC1TileId.FLOOR),
  };
}

function layerToJson(layer: {
  id: string;
  name: string;
  visible: boolean;
  grid: Grid<CC1Cell | null>;
}): DatLayersLayerJson {
  const { size } = layer.grid;
  const rows: DatLayersCellJson[][] = [];

  for (let y = 0; y < size.height; y++) {
    const row: DatLayersCellJson[] = [];
    for (let x = 0; x < size.width; x++) {
      const cell = layer.grid.get({ x, y });
      row.push(cellToJson(cell));
    }
    rows.push(row);
  }

  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    grid: rows,
  };
}

function levelToJson(level: LevelWithLayers<CC1Cell>): DatLayersLevelJson {
  const meta: Record<string, unknown> = (level.meta as GameLevelMetadata)?.extra ?? {};

  return {
    id: level.id,
    name: level.name,
    size: level.size,
    meta,
    layers: level.layers.map((layer) => layerToJson(layer)),
    activeLayerId: level.activeLayerId,
  };
}

function projectToJson(project: LevelsetWithLayers<CC1Cell>): DatLayersProjectJson {
  return {
    schemaVersion: 1,
    project: {
      id: project.id,
      name: project.name,
      gameId: 'cc1',
      meta: {},
    },
    levels: project.levels.map(levelToJson),
  };
}

// ---------------------------------------------------------------------------
// FileFormatDescriptor
// ---------------------------------------------------------------------------

export const datLayersJsonFileFormat: FileFormatDescriptor<CC1Cell> = {
  id: 'file.datlayers_json',
  displayName: 'DAT Layers JSON',
  filenameExtensions: ['.datlayers.json'],
  gameId: 'cc1',
  canRead: true,
  canWrite: true,

  async read(data: string): Promise<LevelsetWithLayers<CC1Cell>> {
    let parsed: unknown;

    try {
      parsed = JSON.parse(data) as unknown;
    } catch (error) {
      console.error('Failed to parse .datlayers.json', error);
      throw new Error('Invalid JSON');
    }

    const json = ensureValidProjectJson(parsed);
    return projectFromJson(json);
  },

  async write(project: LevelsetWithLayers<CC1Cell>): Promise<string> {
    const json = projectToJson(project);

    const validForWrite = validate(json);
    if (!validForWrite) {
      console.error('datlayers.json validation errors during write:', validate.errors);
      // We still return the JSON, but you could throw here if you want strictness.
    }

    return JSON.stringify(json, null, 2);
  },
};
