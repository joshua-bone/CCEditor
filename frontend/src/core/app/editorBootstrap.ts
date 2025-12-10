// frontend/src/core/app/editorBootstrap.ts

import type { GameCellBase } from '../model/gameTypes';
import type { GameDefinition } from '../game/gameDefinition';
import { createCC1GameDefinition } from '../game/cc1/cc1GameDefinition';
import type { CC1Cell } from '../game/cc1/cc1Types';

import { createPluginRegistry } from '../plugin/pluginRegistry';
import { createEditorContext } from '../plugin/pluginRegistry';
import type { PluginRegistry } from '../plugin/pluginRegistry';
import type { EditorContext, Plugin } from '../plugin/pluginApi';

import { createInitialEditorState } from './editorState';
import { createEmptyHistory } from './editorHistory';
import { createEditorStore, type GameDefinitionMap } from './editorStore';
import type { EditorStoreState } from './editorStore';
import type { StoreApi, UseBoundStore } from 'zustand';

export interface EditorRuntime<TCell extends GameCellBase = GameCellBase> {
  gameDefinitions: GameDefinitionMap<TCell>;
  pluginRegistry: PluginRegistry<TCell>;
  editorContext: EditorContext<TCell>;

  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<TCell>>>;
}

export function registerBuiltinPlugins<TCell extends GameCellBase>(
  ctx: EditorContext<TCell>,
  plugins: Plugin<TCell>[],
): void {
  for (const plugin of plugins) {
    ctx.log(`Activating plugin '${plugin.id}'`);
    plugin.activate(ctx);
  }
}

export function createEditor(builtinPlugins: Plugin<CC1Cell>[] = []): EditorRuntime<CC1Cell> {
  // 1. Build game definitions (for now only CC1)
  const cc1Def = createCC1GameDefinition();
  const gameDefinitions: GameDefinitionMap<CC1Cell> = new Map<string, GameDefinition<CC1Cell>>([
    ['cc1', cc1Def],
  ]);

  // 2. Create plugin registry and editor context
  const registry = createPluginRegistry<CC1Cell>();
  const editorContext = createEditorContext(
    registry,
    gameDefinitions as unknown as GameDefinitionMap<GameCellBase>,
  );

  // 3. Activate builtin plugins
  registerBuiltinPlugins(editorContext, builtinPlugins);

  // 4. Create initial editor state & history for CC1
  const initialState = createInitialEditorState<CC1Cell>(cc1Def);
  const initialHistory = createEmptyHistory(initialState);

  // 5. Create Zustand store
  const useEditorStore = createEditorStore<CC1Cell>(initialHistory, gameDefinitions);

  return {
    gameDefinitions,
    pluginRegistry: registry,
    editorContext,
    useEditorStore,
  };
}
