// frontend/src/ui/layout/CenterPane.tsx

import React from 'react';
import type { LevelWithLayers } from '../../core/model/layers';
import type { SelectionRect } from '../../core/model/selection';
import type { GameDefinition } from '../../core/game/gameDefinition';
import type { GameCellBase } from '../../core/model/gameTypes';
import { LevelCanvas } from '../LevelCanvas';

interface CenterPaneProps {
  level: LevelWithLayers<GameCellBase> | undefined;
  selection: SelectionRect | null;
  gameDefinition: GameDefinition<GameCellBase> | undefined;
}

export const CenterPane: React.FC<CenterPaneProps> = ({ level, selection, gameDefinition }) => {
  return (
    <main className="CenterPane">
      <LevelCanvas level={level} selection={selection} gameDefinition={gameDefinition} />
    </main>
  );
};
