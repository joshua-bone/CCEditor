// frontend/src/ui/LevelCanvas.tsx

import React, { useMemo, useState } from 'react';
import type { LevelWithLayers } from '../core/model/layers';
import type { SelectionRect } from '../core/model/selection';
import type { GameDefinition } from '../core/game/gameDefinition';
import type { GameCellBase } from '../core/model/gameTypes';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { EditorStoreState } from '../core/app/editorStore';
import type { ToolRuntimeContext } from '../core/plugin/toolTypes';
import type { ToolDescriptor } from '../core/plugin/toolTypes';
import type { PointerEvent as ToolPointerEvent, KeyModifiers } from '../core/plugin/events';
import { createToolRuntimeContext } from '../core/app/toolRuntime';
import type { CC1Cell } from '../core/game/cc1/cc1Types';
import { CC1TileId, cc1TileIdToName } from '../core/game/cc1/cc1Tiles';
import type { Coords } from '../core/model/types';

export interface LevelCanvasProps {
  level: LevelWithLayers<GameCellBase> | undefined;
  selection: SelectionRect | null;
  gameDefinition: GameDefinition<GameCellBase> | undefined;
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>;
  activeTool: ToolDescriptor<CC1Cell> | null;
}

const CELL_SIZE = 24;

export const LevelCanvas: React.FC<LevelCanvasProps> = ({
  level,
  selection,
  gameDefinition,
  useEditorStore,
  activeTool,
}) => {
  const [zoom, setZoom] = useState(1.0);

  const flattened = useMemo(() => {
    if (!level || !gameDefinition) return null;
    return gameDefinition.flattenLevelWithLayers(level);
  }, [level, gameDefinition]);

  const symbolsById = useMemo(() => {
    if (!gameDefinition || gameDefinition.gameId !== 'cc1') {
      return null;
    }
    const palette = gameDefinition.getTilePalette();
    const map = new Map<string, string>();
    for (const tile of palette) {
      const baseSymbol = tile.symbol ?? (tile.label.length > 0 ? tile.label[0] : '■');
      map.set(tile.id, baseSymbol);
    }
    return map;
  }, [gameDefinition]);

  if (!level || !flattened) {
    return <div className="LevelCanvas-empty">No level or game definition available.</div>;
  }

  const runtimeContext: ToolRuntimeContext<CC1Cell> | null =
    activeTool && gameDefinition && gameDefinition.gameId === 'cc1'
      ? createToolRuntimeContext(useEditorStore, gameDefinition as GameDefinition<CC1Cell>)
      : null;

  const { size, grid } = flattened;

  const isSelected = (x: number, y: number): boolean => {
    if (!selection) return false;
    return x >= selection.x1 && x <= selection.x2 && y >= selection.y1 && y <= selection.y2;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCellClick = (_coords: Coords): void => {
    // Placeholder for future click behavior; brush painting uses pointer events instead.
  };

  const cells: React.ReactNode[] = Array.from({ length: size.height * size.width }, (_, index) => {
    const col = index % size.width;
    const row = Math.floor(index / size.width);

    const cell = grid.get({ x: col, y: row }) as GameCellBase;
    const selected = isSelected(col, row);

    let label = '·';

    if (gameDefinition?.gameId === 'cc1' && symbolsById) {
      const cc1Cell = cell as CC1Cell;
      const topCode = cc1Cell.top ?? CC1TileId.FLOOR;
      const tileName = cc1TileIdToName(topCode);
      const symbol = symbolsById.get(tileName) ?? '■';
      label = symbol;
    } else {
      const hasTop = (cell as { top?: unknown }).top !== undefined;
      label = hasTop ? '■' : '·';
    }

    return (
      <div
        key={`${col}-${row}`}
        className={'LevelCanvas-cell' + (selected ? ' LevelCanvas-cell--selected' : '')}
        onClick={() => handleCellClick({ x: col, y: row })}
      >
        {label}
      </div>
    );
  });

  function toKeyModifiers(ev: React.MouseEvent<HTMLDivElement>): KeyModifiers {
    return {
      alt: ev.altKey,
      ctrl: ev.ctrlKey,
      meta: ev.metaKey,
      shift: ev.shiftKey,
    };
  }

  function toPointerButton(
    ev: React.MouseEvent<HTMLDivElement>,
  ): 'left' | 'middle' | 'right' | 'aux' {
    if (ev.button === 1) return 'middle';
    if (ev.button === 2) return 'right';
    if (ev.button === 0) return 'left';
    return 'aux';
  }

  function toPointerEvent(
    ev: React.MouseEvent<HTMLDivElement>,
    kind: 'down' | 'move' | 'up',
    zoom: number,
  ): ToolPointerEvent | null {
    const rect = ev.currentTarget.getBoundingClientRect();
    const xPixels = ev.clientX - rect.left;
    const yPixels = ev.clientY - rect.top;
    const scaled = CELL_SIZE * zoom;
    if (scaled <= 0) return null;
    const x = Math.floor(xPixels / scaled);
    const y = Math.floor(yPixels / scaled);
    if (x < 0 || y < 0) return null;

    return {
      kind,
      button: toPointerButton(ev),
      coords: { x, y },
      modifiers: toKeyModifiers(ev),
    };
  }

  return (
    <div className="LevelCanvas-wrapper">
      <div className="CanvasToolbar">
        <span className="CanvasToolbar-label">Zoom:</span>
        <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
          –
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
          +
        </button>
        <span className="CanvasToolbar-zoomValue">{Math.round(zoom * 100)}%</span>
      </div>
      <div className="LevelCanvas-scroll">
        <div
          className="LevelCanvas"
          style={{
            width: size.width * CELL_SIZE,
            height: size.height * CELL_SIZE,
            gridTemplateColumns: `repeat(${size.width}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${size.height}, ${CELL_SIZE}px)`,
            transform: `scale(${zoom})`,
          }}
          onContextMenu={(ev) => {
            ev.preventDefault();
          }}
          onMouseDown={(ev) => {
            ev.preventDefault();
            if (!runtimeContext || !activeTool?.behavior.onPointerDown) return;
            const pe = toPointerEvent(ev, 'down', zoom);
            if (!pe) return;
            activeTool.behavior.onPointerDown(runtimeContext, pe);
          }}
          onMouseMove={(ev) => {
            if (!runtimeContext || !activeTool?.behavior.onPointerMove) return;
            const pe = toPointerEvent(ev, 'move', zoom);
            if (!pe) return;
            activeTool.behavior.onPointerMove(runtimeContext, pe);
          }}
          onMouseUp={(ev) => {
            if (!runtimeContext || !activeTool?.behavior.onPointerUp) return;
            const pe = toPointerEvent(ev, 'up', zoom);
            if (!pe) return;
            activeTool.behavior.onPointerUp(runtimeContext, pe);
          }}
        >
          {cells}
        </div>
      </div>
    </div>
  );
};
