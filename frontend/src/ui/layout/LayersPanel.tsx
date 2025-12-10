// frontend/src/ui/layout/LayersPanel.tsx

import React, { useState } from 'react';

export interface LayerListItem {
  id: string;
  name: string;
  index: number;
  isBackground: boolean;
  visible: boolean;
}

interface LayersPanelProps {
  layers: LayerListItem[];
  activeLayerId: string;
  onSelectLayer(layerId: string): void;
  onToggleVisibility(layerId: string, visible: boolean): void;
  onAddLayer(): void;
  onRemoveLayer(layerId: string): void;
  onMoveLayer(layerId: string, direction: 'up' | 'down'): void;
  onNewLayerFromSelection(): void;
  onRenameLayer(layerId: string, name: string): void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onAddLayer,
  onRemoveLayer,
  onMoveLayer,
  onNewLayerFromSelection,
  onRenameLayer,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const commitEditing = () => {
    if (editingId !== null) {
      const trimmed = editingName.trim();
      if (trimmed.length > 0) {
        onRenameLayer(editingId, trimmed);
      }
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="LayersPanel">
      <div className="LayersPanel-header">
        <span>Layers</span>
        <div className="LayersPanel-headerButtons">
          <button
            type="button"
            className="LayersPanel-button LayersPanel-button--add"
            onClick={onAddLayer}
            title="Add layer"
          >
            +
          </button>
          <button
            type="button"
            className="LayersPanel-button"
            onClick={onNewLayerFromSelection}
            title="New layer from selection"
          >
            ⧉
          </button>
        </div>
      </div>

      <ul className="LayersPanel-list">
        {layers
          .slice()
          .reverse() // draw top-most first
          .map((layer, idx, arr) => {
            const isActive = layer.id === activeLayerId;
            const isBackground = layer.isBackground;
            const canMoveUp = idx < arr.length - 1;
            const canMoveDown = idx > 0;
            const canRemove = !isBackground;

            const isEditing = editingId === layer.id;

            return (
              <li
                key={layer.id}
                className={
                  'LayersPanel-item' +
                  (isActive ? ' LayersPanel-item--active' : '') +
                  (isBackground ? ' LayersPanel-item--background' : '')
                }
              >
                <button
                  type="button"
                  className="LayersPanel-eye"
                  onClick={() => onToggleVisibility(layer.id, !layer.visible)}
                >
                  {layer.visible ? '👁' : '🙈'}
                </button>

                <button
                  type="button"
                  className="LayersPanel-itemMain"
                  onClick={() => onSelectLayer(layer.id)}
                  onDoubleClick={() => startEditing(layer.id, layer.name)}
                >
                  {isEditing ? (
                    <input
                      className="LayersPanel-nameInput"
                      value={editingName}
                      autoFocus
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={commitEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEditing();
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                  ) : (
                    <>
                      <span className="LayersPanel-name">{layer.name || '(unnamed layer)'}</span>
                      {isBackground && <span className="LayersPanel-tag">BG</span>}
                    </>
                  )}
                </button>

                <div className="LayersPanel-itemButtons">
                  <button
                    type="button"
                    className="LayersPanel-button LayersPanel-button--move"
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    disabled={!canMoveUp}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="LayersPanel-button LayersPanel-button--move"
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    disabled={!canMoveDown}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="LayersPanel-button LayersPanel-button--delete"
                    onClick={() => onRemoveLayer(layer.id)}
                    disabled={!canRemove}
                    title={canRemove ? 'Remove layer' : 'Cannot remove background layer'}
                  >
                    –
                  </button>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
