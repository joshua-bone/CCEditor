// frontend/src/ui/layout/StatusBar.tsx

import React from 'react';
import type { SelectionRect } from '../../core/model/selection';

interface StatusBarProps {
  zoom: number;
  selection: SelectionRect | null;
  leftTileLabel?: string;
  rightTileLabel?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  zoom,
  selection,
  leftTileLabel,
  rightTileLabel,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="StatusBar">
      <div className="StatusBar-left">
        Zoom: {zoomPercent}%
        {leftTileLabel && <span className="StatusBar-tile"> L: {leftTileLabel}</span>}
        {rightTileLabel && <span className="StatusBar-tile"> R: {rightTileLabel}</span>}
      </div>
      <div className="StatusBar-center">
        {selection
          ? `Selection: (${selection.x1},${selection.y1}) → (${selection.x2},${selection.y2})`
          : 'No selection'}
      </div>
      <div className="StatusBar-right">Shell ready</div>
    </footer>
  );
};
