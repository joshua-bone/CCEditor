import React from 'react';
import type { TileDescriptor } from '../../core/game/gameDefinition';
import { TilePalette } from '../TilePalette';
import type { LayerListItem } from './LayersPanel';
import { LayersPanel } from './LayersPanel';

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
    </aside>
  );
};
