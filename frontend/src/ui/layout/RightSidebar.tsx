import React from 'react';
import type { GameDefinition, TileDescriptor } from '../../core/game/gameDefinition';
import { TilePalette } from '../TilePalette';
import type { LayerListItem } from './LayersPanel';
import { LayersPanel } from './LayersPanel';
import type { GeneratorDescriptor } from '../../core/plugin/generatorTypes';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { GameCellBase } from '../../core/model/gameTypes';
import type { EditorStoreState } from '../../core/app/editorStore';
import type { CC1Cell } from '../../core/game/cc1/cc1Types';
import { GeneratorsPanel } from './GeneratorsPanel';
import type { PanelDescriptor } from '../../core/plugin/panelTypes';
import { OverlaysPanel } from './OverlaysPanel';

interface RightSidebarProps {
  tiles: TileDescriptor[];
  leftTileId: string | null;
  rightTileId: string | null;
  onSetLeft(tileId: string): void;
  onSetRight(tileId: string): void;

  layers: LayerListItem[];
  activeLayerId: string;
  onSelectLayer(layerId: string): void;
  onToggleLayerVisibility(layerId: string, visible: boolean): void;
  onAddLayer(): void;
  onRemoveLayer(layerId: string): void;
  onMoveLayer(layerId: string, direction: 'up' | 'down'): void;
  onNewLayerFromSelection(): void;
  onRenameLayer(layerId: string, name: string): void;
  overlayPanels: PanelDescriptor<CC1Cell>[];
  overlaysEnabled: Record<string, boolean>;
  onToggleOverlay(id: string, enabled: boolean): void;

  generators: GeneratorDescriptor<CC1Cell>[];
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>;
  gameDefinition: GameDefinition<GameCellBase> | undefined;
}

export const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const {
    tiles,
    leftTileId,
    rightTileId,
    onSetLeft,
    onSetRight,
    layers,
    activeLayerId,
    onSelectLayer,
    onToggleLayerVisibility,
    onAddLayer,
    onRemoveLayer,
    onMoveLayer,
    onNewLayerFromSelection,
    onRenameLayer,
    overlayPanels,
    overlaysEnabled,
    onToggleOverlay,
    generators,
    useEditorStore,
    gameDefinition,
  } = props;

  return (
    <aside className="RightSidebar">
      <h2 className="Sidebar-heading">Tile Palette</h2>
      <TilePalette
        tiles={tiles}
        leftTileId={leftTileId}
        rightTileId={rightTileId}
        onSetLeft={onSetLeft}
        onSetRight={onSetRight}
      />

      <hr className="Sidebar-separator" />

      <LayersPanel
        layers={layers}
        activeLayerId={activeLayerId}
        onSelectLayer={onSelectLayer}
        onToggleVisibility={onToggleLayerVisibility}
        onAddLayer={onAddLayer}
        onRemoveLayer={onRemoveLayer}
        onMoveLayer={onMoveLayer}
        onNewLayerFromSelection={onNewLayerFromSelection}
        onRenameLayer={onRenameLayer}
      />

      <hr className="Sidebar-separator" />

      <GeneratorsPanel
        generators={generators}
        useEditorStore={useEditorStore}
        gameDefinition={gameDefinition as GameDefinition<CC1Cell> | undefined}
      />

      <hr className="Sidebar-separator" />

      <OverlaysPanel
        panels={overlayPanels}
        overlaysEnabled={overlaysEnabled}
        onToggleOverlay={onToggleOverlay}
      />
    </aside>
  );
};
