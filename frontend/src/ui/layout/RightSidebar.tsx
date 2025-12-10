import React from 'react';
import type { TileDescriptor } from '../../core/game/gameDefinition';
import { TilePalette } from '../TilePalette';

interface RightSidebarProps {
  tiles: TileDescriptor[];
  leftTileId: string | null;
  rightTileId: string | null;
  onSetLeft(tileId: string): void;
  onSetRight(tileId: string): void;
}
export const RightSidebar: React.FC<RightSidebarProps> = ({
  tiles,
  leftTileId,
  rightTileId,
  onSetLeft,
  onSetRight,
}) => {
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
    </aside>
  );
};
