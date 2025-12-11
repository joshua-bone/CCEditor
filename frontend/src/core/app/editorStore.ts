// frontend/src/core/app/editorStore.ts

import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';

import type { GameCellBase } from '../model/gameTypes';
import type { EditorHistory } from './editorHistory';
import { applyEditorCommand, undo, redo, type EditorCommand } from './editorCommands';
import type { GameDefinition } from '../game/gameDefinition';
import type { EditorState } from './editorState';
import { copySelection } from '../model/layers';
import type { LayerClipboard } from '../model/clipboard';

export type GameDefinitionMap<TCell extends GameCellBase = GameCellBase> = Map<
  string,
  GameDefinition<TCell>
>;

export interface EditorStoreState<TCell extends GameCellBase = GameCellBase> {
  history: EditorHistory<TCell>;

  dispatchCommand(command: EditorCommand): void;
  undo(): void;
  redo(): void;

  loadStateFromProject(state: EditorState<TCell>): void;

  setLeftPaletteTile(tileId: string | null): void;
  setRightPaletteTile(tileId: string | null): void;

  setClipboard(clipboard: LayerClipboard<TCell> | null): void;
  copySelectionToClipboard(): void;
}

export function createEditorStore<TCell extends GameCellBase>(
  initialHistory: EditorHistory<TCell>,
  gameDefinitions: GameDefinitionMap<TCell>,
): UseBoundStore<StoreApi<EditorStoreState<TCell>>> {
  return create<EditorStoreState<TCell>>((set, get) => ({
    history: initialHistory,

    dispatchCommand(command) {
      set((state) => {
        const presentGameId = state.history.present.gameId as string;
        const def = gameDefinitions.get(presentGameId);

        if (!def) {
          // No game definition found; no-op
          return state;
        }

        const nextHistory = applyEditorCommand(state.history, command, def);

        return { ...state, history: nextHistory };
      });
    },

    undo() {
      set((state) => ({
        ...state,
        history: undo(state.history),
      }));
    },

    redo() {
      set((state) => ({
        ...state,
        history: redo(state.history),
      }));
    },

    loadStateFromProject(state: EditorState<TCell>) {
      set(() => ({
        history: {
          past: [],
          present: state,
          future: [],
        },
      }));
    },
    setLeftPaletteTile(tileId) {
      set((state) => {
        const present = state.history.present;
        const nextPresent: EditorState<TCell> = {
          ...present,
          paletteSelection: {
            ...present.paletteSelection,
            leftTileId: tileId,
          },
        };
        return {
          ...state,
          history: {
            ...state.history,
            present: nextPresent,
          },
        };
      });
    },

    setRightPaletteTile(tileId) {
      set((state) => {
        const present = state.history.present;
        const nextPresent: EditorState<TCell> = {
          ...present,
          paletteSelection: {
            ...present.paletteSelection,
            rightTileId: tileId,
          },
        };
        return {
          ...state,
          history: {
            ...state.history,
            present: nextPresent,
          },
        };
      });
    },
    setClipboard(clipboard) {
      set((state) => {
        const present = state.history.present;
        const nextPresent: EditorState<TCell> = {
          ...present,
          clipboard,
        };
        return {
          ...state,
          history: {
            ...state.history,
            present: nextPresent,
          },
        };
      });
    },

    copySelectionToClipboard() {
      const state = get();
      const { history } = state;
      const present = history.present;

      const level = present.levelset.levels.find((lvl) => lvl.id === present.currentLevelId);
      const selection = present.selection;
      if (!level || !selection) {
        return;
      }

      const clipboard = copySelection(level, selection, level.activeLayerId);
      state.setClipboard(clipboard);
    },
  }));
}
