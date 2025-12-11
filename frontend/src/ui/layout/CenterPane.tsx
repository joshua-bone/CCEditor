// frontend/src/ui/layout/CenterPane.tsx

import React from 'react';
import type { LevelWithLayers } from '../../core/model/layers';
import type { SelectionRect } from '../../core/model/selection';
import type { GameDefinition } from '../../core/game/gameDefinition';
import type { GameCellBase } from '../../core/model/gameTypes';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { EditorStoreState } from '../../core/app/editorStore';
import type { ToolDescriptor } from '../../core/plugin/toolTypes';
import type { CC1Cell } from '../../core/game/cc1/cc1Types';
import { LevelCanvas } from '../LevelCanvas';

interface CenterPaneProps {
  level: LevelWithLayers<GameCellBase> | undefined;
  selection: SelectionRect | null;
  gameDefinition: GameDefinition<GameCellBase> | undefined;
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>;
  activeTool: ToolDescriptor<CC1Cell> | null;
}

export const CenterPane: React.FC<CenterPaneProps> = ({
  level,
  selection,
  gameDefinition,
  useEditorStore,
  activeTool,
}) => {
  return (
    <main className="CenterPane">
      <LevelCanvas
        level={level}
        selection={selection}
        gameDefinition={gameDefinition}
        useEditorStore={useEditorStore}
        activeTool={activeTool}
      />
    </main>
  );
};
