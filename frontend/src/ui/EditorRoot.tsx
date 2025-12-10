// frontend/src/ui/EditorRoot.tsx

import React from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { EditorStoreState } from '../core/app/editorStore';
import type { GameDefinitionMap } from '../core/app/editorStore';
import type { GameDefinition } from '../core/game/gameDefinition';
import type { GameCellBase } from '../core/model/gameTypes';
import type { LevelWithLayers } from '../core/model/layers';
import type { SelectionRect } from '../core/model/selection';

import { TopToolbar } from './layout/TopToolbar';
import { LeftSidebar } from './layout/LeftSidebar';
import { CenterPane } from './layout/CenterPane';
import { RightSidebar } from './layout/RightSidebar';
import { StatusBar } from './layout/StatusBar';

export interface EditorRootProps {
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState>>;
  gameDefinitions: GameDefinitionMap;
}

export const EditorRoot: React.FC<EditorRootProps> = ({ useEditorStore, gameDefinitions }) => {
  const dispatchCommand = useEditorStore((s) => s.dispatchCommand);

  const paletteSelection = useEditorStore((s) => s.history.present.paletteSelection);
  const setLeftPaletteTile = useEditorStore((s) => s.setLeftPaletteTile);
  const setRightPaletteTile = useEditorStore((s) => s.setRightPaletteTile);
  const history = useEditorStore((s) => s.history);
  const { present } = history;

  const levelset = present.levelset;
  const currentLevel: LevelWithLayers<GameCellBase> | undefined = levelset.levels.find(
    (lvl) => lvl.id === present.currentLevelId,
  ) as LevelWithLayers<GameCellBase> | undefined;
  const levelsForList = levelset.levels.map((lvl, index) => ({
    id: lvl.id,
    name: lvl.name,
    index,
  }));

  const gameDefinition: GameDefinition<GameCellBase> | undefined = gameDefinitions.get(
    present.gameId as string,
  ) as GameDefinition<GameCellBase> | undefined;
  const paletteTiles = gameDefinition?.getTilePalette() ?? [];
  const leftDescriptor = paletteTiles.find((t) => t.id === paletteSelection.leftTileId);
  const rightDescriptor = paletteTiles.find((t) => t.id === paletteSelection.rightTileId);

  const handleSelectLevel = (levelId: string) => {
    dispatchCommand({ type: 'SET_CURRENT_LEVEL', levelId });
  };

  const handleAddLevel = () => {
    dispatchCommand({ type: 'ADD_LEVEL' });
  };

  const handleDeleteLevel = (levelId: string) => {
    dispatchCommand({ type: 'DELETE_LEVEL', levelId });
  };

  const handleMoveLevel = (levelId: string, direction: 'up' | 'down') => {
    const idx = levelset.levels.findIndex((l) => l.id === levelId);
    if (idx === -1) return;

    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    dispatchCommand({
      type: 'REORDER_LEVEL',
      levelId,
      newIndex,
    });
  };
  return (
    <>
      <TopToolbar projectId={present.projectId} gameId={present.gameId} />

      <div className="MainLayout">
        <LeftSidebar
          levels={levelsForList}
          currentLevelId={present.currentLevelId}
          onSelectLevel={handleSelectLevel}
          onAddLevel={handleAddLevel}
          onDeleteLevel={handleDeleteLevel}
          onMoveLevel={handleMoveLevel}
        />

        <CenterPane
          level={currentLevel}
          selection={present.selection as SelectionRect | null}
          gameDefinition={gameDefinition}
        />
        <RightSidebar
          tiles={paletteTiles}
          leftTileId={paletteSelection.leftTileId}
          rightTileId={paletteSelection.rightTileId}
          onSetLeft={setLeftPaletteTile}
          onSetRight={setRightPaletteTile}
        />
        <StatusBar
          zoom={present.viewState.zoom}
          selection={present.selection}
          leftTileLabel={leftDescriptor?.label}
          rightTileLabel={rightDescriptor?.label}
        />
      </div>

      <StatusBar zoom={present.viewState.zoom} selection={present.selection} />
    </>
  );
};
