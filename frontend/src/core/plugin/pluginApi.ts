// frontend/src/core/plugin/pluginApi.ts

import type { GameCellBase } from '../model/gameTypes';
import type { GameDefinition } from '../game/gameDefinition';
import type { ToolDescriptor } from './toolTypes';
import type { GeneratorDescriptor } from './generatorTypes';
import type { FileFormatDescriptor } from './fileFormatTypes';
import type { PanelDescriptor } from './panelTypes';

export type PluginType = 'tool' | 'generator' | 'fileFormat' | 'panel' | 'bundle';

export interface EditorContext<TCell extends GameCellBase = GameCellBase> {
  registerTool(descriptor: ToolDescriptor<TCell>): void;
  registerGenerator(descriptor: GeneratorDescriptor<TCell>): void;
  registerFileFormat(descriptor: FileFormatDescriptor<TCell>): void;
  registerPanel(descriptor: PanelDescriptor<TCell>): void;

  log(message: string, meta?: unknown): void;

  getGameDefinition(gameId: string): GameDefinition<GameCellBase> | undefined;
}

export interface Plugin<TCell extends GameCellBase = GameCellBase> {
  id: string; // "plugin.cc1.core"
  type: PluginType;
  displayName: string; // "CC1 Core Plugin"
  activate(ctx: EditorContext<TCell>): void;
}
