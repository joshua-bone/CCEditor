import { describe, it, expect } from 'vitest';
import { createInitialEditorState } from '../editorState';
import { createEmptyHistory } from '../editorHistory';
import { createCC1GameDefinition } from '../../game/cc1/cc1GameDefinition';
import type { CC1Cell } from '../../game/cc1/cc1Types';

describe('createInitialEditorState', () => {
  it('creates a CC1 editor state with one level and background layer', () => {
    const gameDef = createCC1GameDefinition();
    const state = createInitialEditorState<CC1Cell>(gameDef);

    expect(state.gameId).toBe('cc1');
    expect(state.levelset.levels).toHaveLength(1);

    const level = state.levelset.levels[0];
    expect(level.layers).toHaveLength(1);
    expect(level.layers[0].id).toBe('layer-background');
    expect(level.layers[0].visible).toBe(true);
    expect(level.activeLayerId).toBe('layer-background');

    expect(state.currentLevelId).toBe(level.id);
    expect(state.selection).toBeNull();
    expect(state.clipboard).toBeNull();

    expect(state.viewState.zoom).toBe(1);
    expect(state.viewState.pan).toEqual({ x: 0, y: 0 });

    // Palette defaults are at least defined (if palette non-empty)
    const palette = gameDef.getTilePalette();
    if (palette.length > 0) {
      expect(state.paletteSelection.leftTileId).toBe(palette[0].id);
    }
  });
});

describe('createEmptyHistory', () => {
  it('wraps a state with empty past and future', () => {
    const gameDef = createCC1GameDefinition();
    const state = createInitialEditorState<CC1Cell>(gameDef);

    const history = createEmptyHistory(state);

    expect(history.past).toHaveLength(0);
    expect(history.present).toBe(state);
    expect(history.future).toHaveLength(0);
  });
});
