import type { UseBoundStore, StoreApi } from 'zustand';
import type { EditorStoreState } from './editorStore';
import type { GameCellBase } from '../model/gameTypes';
import type { GameDefinition } from '../game/gameDefinition';
import type { GeneratorRuntimeContext } from '../plugin/generatorTypes';
import type { LevelWithLayers, Transparent } from '../model/layers';
import type { SelectionRect } from '../model/selection';
import type { Grid } from '../model/grid';
import type { LayerId } from '../model/types';
import type { ApplyLayerUpdateCommand } from './editorCommands';

export function createGeneratorRuntimeContext<TCell extends GameCellBase>(
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<TCell>>>,
  gameDefinition: GameDefinition<TCell>,
): GeneratorRuntimeContext<TCell> {
  // Simple, non-seeded RNG for now. Replace with a seeded one later if needed.
  const rng = () => Math.random();

  return {
    gameDefinition,

    getCurrentLevel(): LevelWithLayers<TCell> {
      const { history } = useEditorStore.getState();
      const present = history.present;
      const level = present.levelset.levels.find((lvl) => lvl.id === present.currentLevelId);
      if (!level) {
        throw new Error('Current level not found');
      }
      return level;
    },

    getSelection(): SelectionRect | null {
      return useEditorStore.getState().history.present.selection;
    },

    updateLayer(
      layerId: LayerId,
      updater: (grid: Grid<TCell | Transparent>) => Grid<TCell | Transparent>,
    ): void {
      const state = useEditorStore.getState();
      const { history, dispatchCommand } = state;
      const present = history.present;
      const level = present.levelset.levels.find((lvl) => lvl.id === present.currentLevelId);
      if (!level) {
        return;
      }

      dispatchCommand({
        type: 'APPLY_LAYER_UPDATE',
        levelId: level.id,
        layerId,
        update: updater,
      } as ApplyLayerUpdateCommand<TCell>);
    },

    random(): number {
      return rng();
    },
  };
}
