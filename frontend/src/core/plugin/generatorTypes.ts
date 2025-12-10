// frontend/src/core/plugin/generatorTypes.ts

import type { GameCellBase } from '../model/gameTypes';
import type { SelectionRect } from '../model/selection';
import type { LevelWithLayers, Transparent } from '../model/layers';
import type { Grid } from '../model/grid';
import type { LayerId } from '../model/types';
import type { GameDefinition } from '../game/gameDefinition';

// Param schema for generator configuration UIs

export type ParamKind = 'number' | 'boolean' | 'enum';

interface BaseParamSchema {
  name: string; // "probability"
  label: string; // "Fill probability"
  kind: ParamKind;
  description?: string;
}

export interface NumberParamSchema extends BaseParamSchema {
  kind: 'number';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export interface BooleanParamSchema extends BaseParamSchema {
  kind: 'boolean';
  defaultValue?: boolean;
}

export interface EnumParamOption {
  value: string;
  label: string;
}

export interface EnumParamSchema extends BaseParamSchema {
  kind: 'enum';
  options: EnumParamOption[];
  defaultValue?: string;
}

export type ParamSchema = NumberParamSchema | BooleanParamSchema | EnumParamSchema;

// Runtime context for generators

export interface GeneratorRuntimeContext<TCell extends GameCellBase = GameCellBase> {
  readonly gameDefinition: GameDefinition<TCell>;

  getCurrentLevel(): LevelWithLayers<TCell>;
  getSelection(): SelectionRect | null;

  /**
   * Update a layer by applying a pure function to its grid.
   * Implementation will handle history / undo/redo later.
   */
  updateLayer(
    layerId: LayerId,
    updater: (grid: Grid<TCell | Transparent>) => Grid<TCell | Transparent>,
  ): void;

  random(): number; // 0 <= n < 1
}

export interface GeneratorDescriptor<TCell extends GameCellBase = GameCellBase> {
  id: string; // "generator.randomNoise"
  displayName: string; // "Random Noise"
  gameId?: TCell['gameId'] | 'any';
  params: ParamSchema[];
  run(ctx: GeneratorRuntimeContext<TCell>, params: Record<string, unknown>): void | Promise<void>;
}
