// frontend/src/ui/layout/LeftSidebar.tsx

import React from 'react';

interface LeftSidebarProps {
  levelCount: number;
  currentLevelName: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ levelCount, currentLevelName }) => {
  return (
    <aside className="LeftSidebar">
      <h2 className="Sidebar-heading">Levels</h2>
      <p>{levelCount} level(s)</p>
      {currentLevelName && <p>Current: {currentLevelName}</p>}
      <p className="Sidebar-placeholder">Level list UI goes here…</p>
    </aside>
  );
};
