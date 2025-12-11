// frontend/src/ui/EditorRoot.tsx

import React from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { EditorStoreState } from '../core/app/editorStore';
import type { GameDefinitionMap } from '../core/app/editorStore';
import type { GameDefinition } from '../core/game/gameDefinition';
import type { GameCellBase } from '../core/model/gameTypes';
import type { LevelWithLayers } from '../core/model/layers';
import type { SelectionRect } from '../core/model/selection';

import { TopToolbar } from './layout/TopToolbar';
import { LeftSidebar } from './layout/LeftSidebar';
import { CenterPane } from './layout/CenterPane';
import { RightSidebar } from './layout/RightSidebar';
import { StatusBar } from './layout/StatusBar';
import type { LayerListItem } from './layout/LayersPanel';

import type { PluginRegistry } from '../core/plugin/pluginRegistry';
import type { ToolDescriptor } from '../core/plugin/toolTypes';
import type { CC1Cell } from '../core/game/cc1/cc1Types';

import { useEffect } from 'react';
import { createToolRuntimeContext } from '../core/app/toolRuntime';
import type { OverlayProvider } from '../core/plugin/panelTypes';

export interface EditorRootProps {
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>;
  gameDefinitions: GameDefinitionMap;
  pluginRegistry: PluginRegistry<CC1Cell>;
}

export const EditorRoot: React.FC<EditorRootProps> = ({
  useEditorStore,
  gameDefinitions,
  pluginRegistry,
}) => {
  const dispatchCommand = useEditorStore((s) => s.dispatchCommand);
  const activeToolId = useEditorStore((s) => s.history.present.activeToolId);
  const activeTool: ToolDescriptor<CC1Cell> | undefined = activeToolId
    ? (pluginRegistry.getTool(activeToolId) as ToolDescriptor<CC1Cell> | undefined)
    : undefined;
  const allTools = pluginRegistry.getTools(); // Map -> array
  const allGenerators = pluginRegistry.getGenerators();
  const allPanels = pluginRegistry.getPanels();

  const overlayPanels = allPanels.filter((p) => p.overlayProvider !== undefined);
  const overlayProviders: OverlayProvider<CC1Cell>[] = overlayPanels
    .map((p) => p.overlayProvider)
    .filter((prov): prov is OverlayProvider<CC1Cell> => prov !== undefined);
  const overlaysEnabled = useEditorStore((s) => s.history.present.viewState.overlaysEnabled);
  const setOverlayEnabled = useEditorStore((s) => s.setOverlayEnabled);

  const paletteSelection = useEditorStore((s) => s.history.present.paletteSelection);
  const setLeftPaletteTile = useEditorStore((s) => s.setLeftPaletteTile);
  const setRightPaletteTile = useEditorStore((s) => s.setRightPaletteTile);
  const history = useEditorStore((s) => s.history);
  const { present } = history;

  const levelset = present.levelset;
  const currentLevel: LevelWithLayers<GameCellBase> | undefined = levelset.levels.find(
    (lvl) => lvl.id === present.currentLevelId,
  ) as LevelWithLayers<GameCellBase> | undefined;
  const levelsForList = levelset.levels.map((lvl, index) => ({
    id: lvl.id,
    name: lvl.name,
    index,
  }));

  const gameDefinition: GameDefinition<GameCellBase> | undefined = gameDefinitions.get(
    present.gameId as string,
  ) as GameDefinition<GameCellBase> | undefined;

  useEffect(() => {
    function handleKeyDown(ev: KeyboardEvent): void {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const ctrlOrCmd = isMac ? ev.metaKey : ev.ctrlKey;

      const state = useEditorStore.getState();
      const { history } = state;
      const present = history.present;

      if (ev.key === 'Escape') {
        ev.preventDefault();
        state.dispatchCommand({ type: 'CLEAR_SELECTION' });
        return;
      }

      const currentGameDef = gameDefinitions.get(present.gameId as string);
      if (!currentGameDef) {
        return;
      }

      const runtime = createToolRuntimeContext<CC1Cell>(
        useEditorStore as UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>,
        currentGameDef as GameDefinition<CC1Cell>,
      );

      if ((ev.key === 'c' || ev.key === 'C') && ctrlOrCmd) {
        ev.preventDefault();
        runtime.copySelectionToClipboard();
      }

      if ((ev.key === 'v' || ev.key === 'V') && ctrlOrCmd) {
        ev.preventDefault();
        const selection = runtime.getSelection();
        const anchor = selection !== null ? { x: selection.x1, y: selection.y1 } : { x: 0, y: 0 };
        runtime.pasteClipboardAt(anchor);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameDefinitions, useEditorStore]);

  const paletteTiles = gameDefinition?.getTilePalette() ?? [];
  const leftDescriptor = paletteTiles.find((t) => t.id === paletteSelection.leftTileId);
  const rightDescriptor = paletteTiles.find((t) => t.id === paletteSelection.rightTileId);

  const handleSelectLevel = (levelId: string) => {
    dispatchCommand({ type: 'SET_CURRENT_LEVEL', levelId });
  };

  const handleAddLevel = () => {
    dispatchCommand({ type: 'ADD_LEVEL' });
  };

  const handleDeleteLevel = (levelId: string) => {
    dispatchCommand({ type: 'DELETE_LEVEL', levelId });
  };

  const handleMoveLevel = (levelId: string, direction: 'up' | 'down') => {
    const idx = levelset.levels.findIndex((l) => l.id === levelId);
    if (idx === -1) return;

    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    dispatchCommand({
      type: 'REORDER_LEVEL',
      levelId,
      newIndex,
    });
  };

  const layersForPanel: LayerListItem[] = currentLevel
    ? currentLevel.layers.map((layer, index) => ({
        id: layer.id,
        name: layer.name,
        index,
        isBackground: index === 0,
        visible: layer.visible,
      }))
    : [];

  const handleSelectLayer = (layerId: string) => {
    if (!currentLevel) return;
    dispatchCommand({
      type: 'SET_ACTIVE_LAYER',
      levelId: currentLevel.id,
      layerId,
    });
  };

  const handleToggleLayerVisibility = (layerId: string, visible: boolean) => {
    if (!currentLevel) return;
    dispatchCommand({
      type: 'SET_LAYER_VISIBILITY',
      levelId: currentLevel.id,
      layerId,
      visible,
    });
  };

  const handleAddLayer = () => {
    if (!currentLevel) return;
    dispatchCommand({
      type: 'ADD_LAYER',
      levelId: currentLevel.id,
      name: 'New Layer',
    });
  };

  const handleRemoveLayer = (layerId: string) => {
    if (!currentLevel) return;
    dispatchCommand({
      type: 'REMOVE_LAYER',
      levelId: currentLevel.id,
      layerId,
    });
  };

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    if (!currentLevel) return;
    const idx = currentLevel.layers.findIndex((l) => l.id === layerId);
    if (idx === -1) return;

    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    dispatchCommand({
      type: 'REORDER_LAYER',
      levelId: currentLevel.id,
      layerId,
      newIndex,
    });
  };

  const handleNewLayerFromSelection = () => {
    if (!currentLevel || !present.selection) return;
    dispatchCommand({
      type: 'NEW_LAYER_FROM_SELECTION',
      levelId: currentLevel.id,
      sourceLayerId: currentLevel.activeLayerId,
      newLayerName: 'From Selection',
    });
  };

  const handleRenameLayer = (layerId: string, name: string) => {
    if (!currentLevel) return;
    dispatchCommand({
      type: 'RENAME_LAYER',
      levelId: currentLevel.id,
      layerId,
      name,
    });
  };

  const handleSelectTool = (toolId: string) => {
    dispatchCommand({
      type: 'SET_ACTIVE_TOOL',
      toolId,
    });
  };

  const handleToggleOverlay = (id: string, enabled: boolean) => {
    setOverlayEnabled(id, enabled);
  };

  return (
    <>
      <TopToolbar
        projectId={present.projectId}
        gameId={present.gameId}
        tools={allTools}
        activeToolId={present.activeToolId}
        onSelectTool={handleSelectTool}
      />

      <div className="MainLayout">
        <LeftSidebar
          levels={levelsForList}
          currentLevelId={present.currentLevelId}
          onSelectLevel={handleSelectLevel}
          onAddLevel={handleAddLevel}
          onDeleteLevel={handleDeleteLevel}
          onMoveLevel={handleMoveLevel}
        />

        <CenterPane
          level={currentLevel}
          selection={present.selection as SelectionRect | null}
          gameDefinition={gameDefinition}
          useEditorStore={useEditorStore}
          activeTool={activeTool ?? null}
          overlayProviders={overlayProviders}
          overlaysEnabled={overlaysEnabled}
        />

        <RightSidebar
          tiles={paletteTiles}
          leftTileId={paletteSelection.leftTileId}
          rightTileId={paletteSelection.rightTileId}
          onSetLeft={setLeftPaletteTile}
          onSetRight={setRightPaletteTile}
          layers={layersForPanel}
          activeLayerId={currentLevel?.activeLayerId ?? ''}
          onSelectLayer={handleSelectLayer}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onAddLayer={handleAddLayer}
          onRemoveLayer={handleRemoveLayer}
          onMoveLayer={handleMoveLayer}
          onNewLayerFromSelection={handleNewLayerFromSelection}
          onRenameLayer={handleRenameLayer}
          generators={allGenerators}
          useEditorStore={useEditorStore}
          gameDefinition={gameDefinition}
          overlayPanels={overlayPanels}
          overlaysEnabled={overlaysEnabled}
          onToggleOverlay={handleToggleOverlay}
        />

        <StatusBar
          zoom={present.viewState.zoom}
          selection={present.selection}
          leftTileLabel={leftDescriptor?.label}
          rightTileLabel={rightDescriptor?.label}
        />
      </div>

      <StatusBar zoom={present.viewState.zoom} selection={present.selection} />
    </>
  );
};
