import { describe, it, expect } from 'vitest';
import { createCC1GameDefinition } from '../../game/cc1/cc1GameDefinition';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import { createInitialEditorState } from '../editorState';
import { createEmptyHistory } from '../editorHistory';
import { applyEditorCommand, undo, redo, type EditorCommand } from '../editorCommands';
import { CC1TileId } from '../../game/cc1/cc1Tiles';

function makeInitialHistory() {
  const gameDef = createCC1GameDefinition();
  const state = createInitialEditorState<CC1Cell>(gameDef);
  const history = createEmptyHistory(state);
  return { gameDef, history };
}

describe('applyEditorCommand and history transitions', () => {
  it('SET_SELECTION pushes history and clears future', () => {
    const { gameDef, history: h0 } = makeInitialHistory();

    const cmd: EditorCommand = {
      type: 'SET_SELECTION',
      selection: { x1: 0, y1: 0, x2: 1, y2: 1 },
    };

    const h1 = applyEditorCommand(h0, cmd, gameDef);

    expect(h1.past).toHaveLength(1);
    expect(h1.future).toHaveLength(0);
    expect(h1.present.selection).toEqual(cmd.selection);
  });

  it('undo and redo move between states correctly', () => {
    const { gameDef, history: h0 } = makeInitialHistory();

    const cmd: EditorCommand = {
      type: 'SET_SELECTION',
      selection: { x1: 0, y1: 0, x2: 0, y2: 0 },
    };

    const h1 = applyEditorCommand(h0, cmd, gameDef);
    const h2 = undo(h1);
    const h3 = redo(h2);

    expect(h1.present.selection).not.toBeNull();
    expect(h2.present.selection).toBeNull(); // undone
    expect(h3.present.selection).toEqual(cmd.selection); // redone
  });
});

describe('PAINT_STROKE', () => {
  it('paints cells and can be undone/redone', () => {
    const { gameDef, history: h0 } = makeInitialHistory();
    const initialLevel = h0.present.levelset.levels[0];

    const cmd: EditorCommand = {
      type: 'PAINT_STROKE',
      levelId: initialLevel.id,
      layerId: initialLevel.layers[0].id,
      points: [{ x: 0, y: 0 }],
      tileId: 'WALL',
      button: 'left',
    };

    const h1 = applyEditorCommand(h0, cmd, gameDef);
    const level1 = h1.present.levelset.levels[0];
    const paintedCell = level1.layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;

    expect(paintedCell.top).toBe(CC1TileId.WALL);

    const h2 = undo(h1);
    const level2 = h2.present.levelset.levels[0];
    const cellAfterUndo = level2.layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;

    expect(cellAfterUndo.top).toBe(CC1TileId.FLOOR);

    const h3 = redo(h2);
    const level3 = h3.present.levelset.levels[0];
    const cellAfterRedo = level3.layers[0].grid.get({ x: 0, y: 0 }) as CC1Cell;

    expect(cellAfterRedo.top).toBe(CC1TileId.WALL);
  });
});

describe('level add/delete', () => {
  it('ADD_LEVEL adds a level and SET_CURRENT_LEVEL updates currentLevelId', () => {
    const { gameDef, history: h0 } = makeInitialHistory();
    const initialLevelCount = h0.present.levelset.levels.length;

    const addCmd: EditorCommand = { type: 'ADD_LEVEL' };
    const h1 = applyEditorCommand(h0, addCmd, gameDef);

    expect(h1.present.levelset.levels.length).toBe(initialLevelCount + 1);

    const newLevel = h1.present.levelset.levels[1];

    const setCmd: EditorCommand = {
      type: 'SET_CURRENT_LEVEL',
      levelId: newLevel.id,
    };

    const h2 = applyEditorCommand(h1, setCmd, gameDef);
    expect(h2.present.currentLevelId).toBe(newLevel.id);
  });
});
