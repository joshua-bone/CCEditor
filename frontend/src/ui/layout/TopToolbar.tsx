import React from 'react';
import type { ToolDescriptor } from '../../core/plugin/toolTypes';
import type { CC1Cell } from '../../core/game/cc1/cc1Types';

interface TopToolbarProps {
  projectId: string;
  gameId: string;

  tools: ToolDescriptor<CC1Cell>[];
  activeToolId: string | null;
  onSelectTool(toolId: string): void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  projectId,
  gameId,
  tools,
  activeToolId,
  onSelectTool,
}) => {
  return (
    <header className="TopToolbar">
      <div className="TopToolbar-title">
        DATEditor <span className="TopToolbar-subtitle">({gameId})</span>
      </div>

      <div className="TopToolbar-tools">
        {tools.map((tool) => {
          const isActive = tool.id === activeToolId;
          const label =
            tool.primaryShortcut ??
            (tool.displayName.length > 0 ? tool.displayName[0].toUpperCase() : '?');

          return (
            <button
              key={tool.id}
              type="button"
              className={
                'TopToolbar-toolButton' + (isActive ? ' TopToolbar-toolButton--active' : '')
              }
              title={tool.displayName}
              onClick={() => onSelectTool(tool.id)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="TopToolbar-spacer" />

      <div className="TopToolbar-project">
        Project: <span className="TopToolbar-projectId">{projectId}</span>
      </div>
    </header>
  );
};
