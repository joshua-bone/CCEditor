// frontend/src/ui/EditorRoot.tsx

import React from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { EditorStoreState } from '../core/app/editorStore';

import { TopToolbar } from './layout/TopToolbar';
import { LeftSidebar } from './layout/LeftSidebar';
import { CenterPane } from './layout/CenterPane';
import { RightSidebar } from './layout/RightSidebar';
import { StatusBar } from './layout/StatusBar';

export interface EditorRootProps {
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState>>;
}

export const EditorRoot: React.FC<EditorRootProps> = ({ useEditorStore }) => {
  const history = useEditorStore((s) => s.history);
  const { present } = history;

  // Very simple derived values for placeholders
  const levelCount = present.levelset.levels.length;
  const currentLevel = present.levelset.levels.find((lvl) => lvl.id === present.currentLevelId);

  return (
    <>
      <TopToolbar projectId={present.projectId} gameId={present.gameId} />

      <div className="MainLayout">
        <LeftSidebar levelCount={levelCount} currentLevelName={currentLevel?.name ?? ''} />
        <CenterPane />
        <RightSidebar />
      </div>

      <StatusBar zoom={present.viewState.zoom} selection={present.selection} />
    </>
  );
};
