import { describe, it, expect } from 'vitest';
import { createEditorStore } from '../editorStore';
import { createCC1GameDefinition } from '../../game/cc1/cc1GameDefinition';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import { createInitialEditorState } from '../editorState';
import { createEmptyHistory } from '../editorHistory';
import { type EditorCommand } from '../editorCommands';
import { CC1TileId } from '../../game/cc1/cc1Tiles';

describe('EditorStore', () => {
  function makeStore() {
    const def = createCC1GameDefinition();
    const state = createInitialEditorState<CC1Cell>(def);
    const history = createEmptyHistory(state);
    const defs = new Map<string, typeof def>([['cc1', def]]);
    const store = createEditorStore<CC1Cell>(history, defs);
    return { def, state, history, defs, store };
  }

  it('initializes with provided history', () => {
    const { history, store } = makeStore();
    const current = store.getState().history.present;
    expect(current).toBe(history.present);
  });

  it('dispatchCommand updates history via applyEditorCommand', () => {
    const { store } = makeStore();
    const level = store.getState().history.present.levelset.levels[0];

    const cmd: EditorCommand = {
      type: 'PAINT_STROKE',
      levelId: level.id,
      layerId: level.layers[0].id,
      points: [{ x: 0, y: 0 }],
      tileId: 'WALL',
      button: 'left',
    };

    // Apply via store
    store.getState().dispatchCommand(cmd);
    const cell = store
      .getState()
      .history.present.levelset.levels[0].layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;
    expect(cell.top).toBe(CC1TileId.WALL);
  });

  it('undo and redo move between states', () => {
    const { store } = makeStore();
    const level = store.getState().history.present.levelset.levels[0];

    const cmd: EditorCommand = {
      type: 'PAINT_STROKE',
      levelId: level.id,
      layerId: level.layers[0].id,
      points: [{ x: 0, y: 0 }],
      tileId: 'WALL',
      button: 'left',
    };

    store.getState().dispatchCommand(cmd);
    const cellPainted = store
      .getState()
      .history.present.levelset.levels[0].layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;
    expect(cellPainted.top).toBe(CC1TileId.WALL);

    store.getState().undo();
    const cellAfterUndo = store
      .getState()
      .history.present.levelset.levels[0].layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;
    expect(cellAfterUndo.top).toBe(CC1TileId.FLOOR);

    store.getState().redo();
    const cellAfterRedo = store
      .getState()
      .history.present.levelset.levels[0].layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;
    expect(cellAfterRedo.top).toBe(CC1TileId.WALL);
  });
});
