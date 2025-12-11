import React from 'react';
import type { PanelDescriptor } from '../../core/plugin/panelTypes';
import type { CC1Cell } from '../../core/game/cc1/cc1Types';

interface OverlaysPanelProps {
  panels: PanelDescriptor<CC1Cell>[];
  overlaysEnabled: Record<string, boolean>;
  onToggleOverlay(id: string, enabled: boolean): void;
}

export const OverlaysPanel: React.FC<OverlaysPanelProps> = ({
  panels,
  overlaysEnabled,
  onToggleOverlay,
}) => {
  if (panels.length === 0) {
    return null;
  }

  return (
    <div className="OverlaysPanel">
      <h2 className="Sidebar-heading">Overlays</h2>
      <ul className="OverlaysPanel-list">
        {panels.map((panel) => {
          const checked = overlaysEnabled[panel.id] ?? false;
          return (
            <li key={panel.id}>
              <label className="OverlaysPanel-item">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggleOverlay(panel.id, e.target.checked)}
                />
                <span className="OverlaysPanel-label">{panel.displayName}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
