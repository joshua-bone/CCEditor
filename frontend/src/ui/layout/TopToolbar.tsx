// frontend/src/ui/layout/TopToolbar.tsx

import React from 'react';

interface TopToolbarProps {
  projectId: string;
  gameId: string;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ projectId, gameId }) => {
  return (
    <header className="TopToolbar">
      <div className="TopToolbar-title">
        DATEditor <span className="TopToolbar-subtitle">({gameId})</span>
      </div>
      <div className="TopToolbar-spacer" />
      <div className="TopToolbar-project">
        Project: <span className="TopToolbar-projectId">{projectId}</span>
      </div>
    </header>
  );
};
