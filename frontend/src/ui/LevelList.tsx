// frontend/src/ui/LevelList.tsx

import React from 'react';

export interface LevelListItem {
  id: string;
  name: string;
  index: number;
}

interface LevelListProps {
  levels: LevelListItem[];
  currentLevelId: string;

  onSelect(levelId: string): void;
  onAdd(): void;
  onDelete(levelId: string): void;
  onMove(levelId: string, direction: 'up' | 'down'): void;
}

export const LevelList: React.FC<LevelListProps> = ({
  levels,
  currentLevelId,
  onSelect,
  onAdd,
  onDelete,
  onMove,
}) => {
  const canDelete = levels.length > 1;

  return (
    <div className="LevelList">
      <div className="LevelList-header">
        <span>Levels</span>
        <div className="LevelList-headerButtons">
          <button
            type="button"
            className="LevelList-button LevelList-button--add"
            onClick={onAdd}
            title="Add level"
          >
            +
          </button>
        </div>
      </div>

      <ul className="LevelList-items">
        {levels.map((lvl, idx) => {
          const isCurrent = lvl.id === currentLevelId;
          const canMoveUp = idx > 0;
          const canMoveDown = idx < levels.length - 1;

          return (
            <li
              key={lvl.id}
              className={'LevelList-item' + (isCurrent ? ' LevelList-item--current' : '')}
            >
              <button type="button" className="LevelList-itemMain" onClick={() => onSelect(lvl.id)}>
                <span className="LevelList-index">{idx + 1}.</span>
                <span className="LevelList-name">{lvl.name || `Level ${idx + 1}`}</span>
              </button>
              <div className="LevelList-itemButtons">
                <button
                  type="button"
                  className="LevelList-button LevelList-button--move"
                  onClick={() => onMove(lvl.id, 'up')}
                  disabled={!canMoveUp}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="LevelList-button LevelList-button--move"
                  onClick={() => onMove(lvl.id, 'down')}
                  disabled={!canMoveDown}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="LevelList-button LevelList-button--delete"
                  onClick={() => onDelete(lvl.id)}
                  disabled={!canDelete}
                  title={canDelete ? 'Delete level' : 'Cannot delete last level'}
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
