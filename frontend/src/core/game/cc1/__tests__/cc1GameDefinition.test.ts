import { describe, it, expect } from 'vitest';
import { createCC1GameDefinition } from '../cc1GameDefinition';
import { CC1TileId } from '../cc1Tiles';
import type { CC1Cell, CC1Level } from '../cc1Types';
import { createGrid } from '../../../model/grid';
import type { LevelWithLayers, LogicalLayer } from '../../../model/layers';

// Helper: wrap a CC1Level in a LevelWithLayers with a single background layer.
function makeLevelWithSingleBackgroundLayer(level: CC1Level): LevelWithLayers<CC1Cell> {
  const bgGrid = createGrid<CC1Cell | null>(level.size, ({ x, y }) => level.grid.get({ x, y }));

  const background: LogicalLayer<CC1Cell> = {
    id: 'layer-background',
    name: 'Background',
    visible: true,
    grid: bgGrid,
  };

  return {
    id: level.id,
    name: level.name,
    size: level.size,
    meta: level.meta,
    layers: [background],
    activeLayerId: background.id,
  };
}

describe('createEmptyLevel', () => {
  it('creates a level of the requested size filled with floor cells', () => {
    const game = createCC1GameDefinition();
    const level = game.createEmptyLevel({ width: 4, height: 3 });

    expect(level.size).toEqual({ width: 4, height: 3 });

    for (let y = 0; y < level.size.height; y++) {
      for (let x = 0; x < level.size.width; x++) {
        const cell = level.grid.get({ x, y });
        expect(cell.gameId).toBe('cc1');
        expect(cell.top).toBe(CC1TileId.FLOOR);
        expect(cell.bottom).toBe(CC1TileId.FLOOR);
      }
    }
  });
});

describe('flattenLevelWithLayers', () => {
  it('picks the topmost non-null cell from layers, or an empty cell if all are null', () => {
    const game = createCC1GameDefinition();
    const baseLevel = game.createEmptyLevel({ width: 2, height: 1 });

    // LevelWithLayers with only background
    let levelWL = makeLevelWithSingleBackgroundLayer(baseLevel);
    const bgLayer = levelWL.layers[0];

    // Add a top layer with a WALL at (1,0)
    const emptyTopGrid = bgLayer.grid.map(() => null as CC1Cell | null);
    const wallCell: CC1Cell = {
      gameId: 'cc1',
      top: CC1TileId.WALL,
      bottom: CC1TileId.FLOOR,
    };
    const topGrid = emptyTopGrid.set({ x: 1, y: 0 }, wallCell);

    const topLayer: LogicalLayer<CC1Cell> = {
      id: 'layer-top',
      name: 'Top',
      visible: true,
      grid: topGrid,
    };

    levelWL = {
      ...levelWL,
      layers: [bgLayer, topLayer],
    };

    const flattened = game.flattenLevelWithLayers(levelWL);

    // (1,0) should be WALL on top from the top layer
    const cell10 = flattened.grid.get({ x: 1, y: 0 });
    expect(cell10.top).toBe(CC1TileId.WALL);
    expect(cell10.bottom).toBe(CC1TileId.FLOOR);

    // (0,0) should still be the original empty cell
    const cell00 = flattened.grid.get({ x: 0, y: 0 });
    expect(cell00.top).toBe(CC1TileId.FLOOR);
    expect(cell00.bottom).toBe(CC1TileId.FLOOR);
  });
});

describe('applyNormalPaint', () => {
  it('places terrain on top when no mob is present', () => {
    const game = createCC1GameDefinition();
    const empty = game.createEmptyCell();

    const withWall = game.applyNormalPaint(empty, 'WALL', 'left');
    expect(withWall.top).toBe(CC1TileId.WALL);
    expect(withWall.bottom).toBe(CC1TileId.FLOOR);
  });

  it('adding a mob to terrain moves terrain to bottom and puts mob on top', () => {
    const game = createCC1GameDefinition();
    const empty = game.createEmptyCell();

    const withWall = game.applyNormalPaint(empty, 'WALL', 'left');
    const withPlayer = game.applyNormalPaint(withWall, 'PLAYER_N', 'left');

    expect(withPlayer.top).toBe(CC1TileId.PLAYER_N);
    expect(withPlayer.bottom).toBe(CC1TileId.WALL);
  });

  it('adding terrain where a mob exists replaces bottom but keeps mob on top', () => {
    const game = createCC1GameDefinition();
    const empty = game.createEmptyCell();

    const withPlayer = game.applyNormalPaint(empty, 'PLAYER_N', 'left');
    const withWallUnderPlayer = game.applyNormalPaint(withPlayer, 'WALL', 'left');

    expect(withWallUnderPlayer.top).toBe(CC1TileId.PLAYER_N);
    expect(withWallUnderPlayer.bottom).toBe(CC1TileId.WALL);
  });
});

describe('applyBuryPaint', () => {
  it('writes directly to bottom and leaves top unchanged', () => {
    const game = createCC1GameDefinition();
    const empty = game.createEmptyCell();

    const buried = game.applyBuryPaint(empty, 'WALL');
    expect(buried.bottom).toBe(CC1TileId.WALL);
    expect(buried.top).toBe(CC1TileId.FLOOR);
  });
});

describe('validateLevel', () => {
  it('reports an error for a cell with a buried mob', () => {
    const game = createCC1GameDefinition();
    const level = game.createEmptyLevel({ width: 2, height: 1 });

    // Create a new grid with a buried player (mob) in bottom
    const newGrid = level.grid.map((cell, coords) =>
      coords.x === 0 && coords.y === 0 ? { ...cell, bottom: CC1TileId.PLAYER_N } : cell,
    );

    const levelWithBuriedMob: CC1Level = {
      ...level,
      grid: newGrid,
    };

    const issues = game.validateLevel(levelWithBuriedMob);
    expect(issues.length).toBeGreaterThan(0);
    const first = issues[0];
    expect(first.levelId).toBe(level.id);
    expect(first.severity).toBe('error');
    expect(first.coords).toEqual({ x: 0, y: 0 });
  });

  it('has no errors for a freshly created empty level', () => {
    const game = createCC1GameDefinition();
    const level = game.createEmptyLevel({ width: 2, height: 2 });

    const issues = game.validateLevel(level);
    expect(issues.length).toBe(0);
  });
});
