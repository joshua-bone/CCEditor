// frontend/src/ui/layout/StatusBar.tsx

import React from 'react';
import type { SelectionRect } from '../../core/model/selection';

interface StatusBarProps {
  zoom: number;
  selection: SelectionRect | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ zoom, selection }) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="StatusBar">
      <div className="StatusBar-left">Zoom: {zoomPercent}%</div>
      <div className="StatusBar-center">
        {selection
          ? `Selection: (${selection.x1},${selection.y1}) → (${selection.x2},${selection.y2})`
          : 'No selection'}
      </div>
      <div className="StatusBar-right">Shell ready</div>
    </footer>
  );
};
