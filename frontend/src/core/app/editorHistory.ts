// frontend/src/core/app/editorHistory.ts

import type { GameCellBase } from '../model/gameTypes';
import type { EditorState } from './editorState';

export interface EditorHistory<TCell extends GameCellBase = GameCellBase> {
  readonly past: EditorState<TCell>[];
  readonly present: EditorState<TCell>;
  readonly future: EditorState<TCell>[];
}

/**
 * Wrap an initial EditorState in an EditorHistory.
 */
export function createEmptyHistory<TCell extends GameCellBase>(
  initialState: EditorState<TCell>,
): EditorHistory<TCell> {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}
