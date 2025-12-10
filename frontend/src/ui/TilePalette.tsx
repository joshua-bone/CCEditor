import React from 'react';
import type { TileDescriptor } from '../core/game/gameDefinition'; // adjust path if needed

interface TilePaletteProps {
  tiles: TileDescriptor[];
  leftTileId: string | null;
  rightTileId: string | null;
  onSetLeft(tileId: string): void;
  onSetRight(tileId: string): void;
}

export const TilePalette: React.FC<TilePaletteProps> = ({
  tiles,
  leftTileId,
  rightTileId,
  onSetLeft,
  onSetRight,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, tileId: string) => {
    if (event.altKey || event.button === 2) {
      // Alt+click or non-left click → right tile
      onSetRight(tileId);
    } else {
      onSetLeft(tileId);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>, tileId: string) => {
    event.preventDefault();
    onSetRight(tileId);
  };

  return (
    <div className="TilePalette">
      {tiles.map((tile) => {
        const isLeft = tile.id === leftTileId;
        const isRight = tile.id === rightTileId;
        const classes = [
          'TilePalette-item',
          isLeft ? 'TilePalette-item--left' : '',
          isRight ? 'TilePalette-item--right' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={tile.id}
            type="button"
            className={classes}
            onClick={(e) => handleClick(e, tile.id)}
            onContextMenu={(e) => handleContextMenu(e, tile.id)}
          >
            <span className="TilePalette-symbol">{tile.symbol ?? '·'}</span>
            <span className="TilePalette-label">{tile.label}</span>
            <span className="TilePalette-tags">
              {isLeft && <span className="TilePalette-tag">L</span>}
              {isRight && <span className="TilePalette-tag">R</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
};
