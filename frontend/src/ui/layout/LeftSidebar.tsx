import React from 'react';
import { LevelList, type LevelListItem } from '../LevelList';

interface LeftSidebarProps {
  levels: LevelListItem[];
  currentLevelId: string;
  onSelectLevel(levelId: string): void;
  onAddLevel(): void;
  onDeleteLevel(levelId: string): void;
  onMoveLevel(levelId: string, direction: 'up' | 'down'): void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  levels,
  currentLevelId,
  onSelectLevel,
  onAddLevel,
  onDeleteLevel,
  onMoveLevel,
}) => {
  return (
    <aside className="LeftSidebar">
      <LevelList
        levels={levels}
        currentLevelId={currentLevelId}
        onSelect={onSelectLevel}
        onAdd={onAddLevel}
        onDelete={onDeleteLevel}
        onMove={onMoveLevel}
      />
    </aside>
  );
};
