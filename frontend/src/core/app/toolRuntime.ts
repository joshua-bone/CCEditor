import type { UseBoundStore, StoreApi } from 'zustand';
import type { GameCellBase } from '../model/gameTypes';
import type { GameDefinition } from '../game/gameDefinition';
import type { EditorStoreState } from './editorStore';
import type { ToolRuntimeContext } from '../plugin/toolTypes';
import type { SelectionRect } from '../model/selection';
import type { Coords } from '../model/types';
import type { LevelWithLayers } from '../model/layers';
import type { LayerClipboard } from '../model/clipboard';
import { linePoints, rectFillPoints } from './paintGeometry';

export function createToolRuntimeContext<TCell extends GameCellBase>(
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<TCell>>>,
  gameDefinition: GameDefinition<TCell>,
): ToolRuntimeContext<TCell> {
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

    getPaletteSelection() {
      return useEditorStore.getState().history.present.paletteSelection;
    },

    getClipboard(): LayerClipboard<TCell> | null {
      return useEditorStore.getState().history.present.clipboard;
    },

    paintStroke(points, tileId, button, mode = 'normal') {
      const state = useEditorStore.getState();
      const { history, dispatchCommand } = state;
      const present = history.present;
      const level = present.levelset.levels.find((lvl) => lvl.id === present.currentLevelId);
      if (!level) {
        return;
      }

      dispatchCommand({
        type: 'PAINT_STROKE',
        levelId: level.id,
        layerId: level.activeLayerId,
        points,
        tileId,
        button,
        mode,
      });
    },

    paintLine(from, to, tileId, button, mode = 'normal') {
      const points = linePoints(from, to);
      if (points.length === 0) {
        return;
      }
      this.paintStroke(points, tileId, button, mode);
    },

    fillRect(rect, tileId, button, mode = 'normal') {
      const topLeft: Coords = {
        x: Math.min(rect.x1, rect.x2),
        y: Math.min(rect.y1, rect.y2),
      };
      const bottomRight: Coords = {
        x: Math.max(rect.x1, rect.x2),
        y: Math.max(rect.y1, rect.y2),
      };
      const points = rectFillPoints(topLeft, bottomRight);
      if (points.length === 0) {
        return;
      }
      this.paintStroke(points, tileId, button, mode);
    },

    setSelection(rect: SelectionRect | null): void {
      const { dispatchCommand } = useEditorStore.getState();
      if (rect) {
        dispatchCommand({
          type: 'SET_SELECTION',
          selection: rect,
        });
      } else {
        dispatchCommand({ type: 'CLEAR_SELECTION' });
      }
    },

    copySelectionToClipboard(): void {
      const { copySelectionToClipboard } = useEditorStore.getState();
      copySelectionToClipboard();
    },

    pasteClipboardAt(anchor: Coords): void {
      const state = useEditorStore.getState();
      const { history, dispatchCommand } = state;
      const present = history.present;
      const level = present.levelset.levels.find((lvl) => lvl.id === present.currentLevelId);
      if (!level) {
        return;
      }

      dispatchCommand({
        type: 'PASTE_CLIPBOARD_AT',
        levelId: level.id,
        layerId: level.activeLayerId,
        anchor,
      });
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newLayerFromSelection(_newLayerName?: string): void {
      // Will be implemented in TS21; no-op for now.
    },
  };
}
