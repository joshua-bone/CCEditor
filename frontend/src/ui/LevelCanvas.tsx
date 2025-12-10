// frontend/src/ui/LevelCanvas.tsx

import React, { useMemo, useState } from 'react';
import type { LevelWithLayers } from '../core/model/layers';
import type { SelectionRect } from '../core/model/selection';
import type { GameDefinition } from '../core/game/gameDefinition';
import type { GameCellBase } from '../core/model/gameTypes';
import type { Coords } from '../core/model/types';

export interface LevelCanvasProps {
  level: LevelWithLayers<GameCellBase> | undefined;
  selection: SelectionRect | null;
  gameDefinition: GameDefinition<GameCellBase> | undefined;
}

const CELL_SIZE = 24;

export const LevelCanvas: React.FC<LevelCanvasProps> = ({ level, selection, gameDefinition }) => {
  const [zoom, setZoom] = useState(1.0);

  const flattened = useMemo(() => {
    if (!level || !gameDefinition) return null;
    return gameDefinition.flattenLevelWithLayers(level);
  }, [level, gameDefinition]);

  if (!level || !flattened) {
    return <div className="LevelCanvas-empty">No level or game definition available.</div>;
  }

  const { size, grid } = flattened;

  const handleCellClick = (coords: Coords) => {
    // For now, just log coordinates
    // Later this will drive tools / commands.
    console.log('Cell clicked:', coords);
  };

  const isSelected = (x: number, y: number): boolean => {
    if (!selection) return false;
    return x >= selection.x1 && x <= selection.x2 && y >= selection.y1 && y <= selection.y2;
  };

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < size.height; y++) {
    for (let x = 0; x < size.width; x++) {
      const cell = grid.get({ x, y }) as unknown;
      const selected = isSelected(x, y);

      // Display a tiny text marker for the top tile.
      // For now, just show "." for floor-ish, "#" for non-floor.
      const hasTop = typeof (cell as { top?: unknown }).top !== 'undefined';
      const label = hasTop ? '■' : '·';

      cells.push(
        <div
          key={`${x}-${y}`}
          className={'LevelCanvas-cell' + (selected ? ' LevelCanvas-cell--selected' : '')}
          onClick={() => handleCellClick({ x, y })}
        >
          {label}
        </div>,
      );
    }
  }

  return (
    <div className="LevelCanvas-wrapper">
      <div className="CanvasToolbar">
        <span className="CanvasToolbar-label">Zoom:</span>
        <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
          –
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
          +
        </button>
        <span className="CanvasToolbar-zoomValue">{Math.round(zoom * 100)}%</span>
      </div>
      <div className="LevelCanvas-scroll">
        <div
          className="LevelCanvas"
          style={{
            width: size.width * CELL_SIZE,
            height: size.height * CELL_SIZE,
            gridTemplateColumns: `repeat(${size.width}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${size.height}, ${CELL_SIZE}px)`,
            transform: `scale(${zoom})`,
          }}
        >
          {cells}
        </div>
      </div>
    </div>
  );
};
