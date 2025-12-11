// frontend/src/ui/LevelCanvas.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LevelWithLayers } from '../core/model/layers';
import type { SelectionRect } from '../core/model/selection';
import type { GameDefinition } from '../core/game/gameDefinition';
import type { GameCellBase, GameLevel } from '../core/model/gameTypes';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { EditorStoreState } from '../core/app/editorStore';
import type { ToolRuntimeContext } from '../core/plugin/toolTypes';
import type { ToolDescriptor } from '../core/plugin/toolTypes';
import type { PointerEvent as ToolPointerEvent, KeyModifiers } from '../core/plugin/events';
import { createToolRuntimeContext } from '../core/app/toolRuntime';
import type { CC1Cell } from '../core/game/cc1/cc1Types';
import { CC1TileId, cc1TileIdToName } from '../core/game/cc1/cc1Tiles';
import type { OverlayProvider, OverlayShape } from '../core/plugin/panelTypes';
import type { Coords } from '../core/model/types';

export interface LevelCanvasProps {
  level: LevelWithLayers<GameCellBase> | undefined;
  selection: SelectionRect | null;
  gameDefinition: GameDefinition<GameCellBase> | undefined;
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>;
  activeTool: ToolDescriptor<CC1Cell> | null;

  overlayProviders: OverlayProvider<CC1Cell>[];
  overlaysEnabled: Record<string, boolean>;
}

const CELL_SIZE = 24;

function setCanvasSize(
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number,
): { ctx: CanvasRenderingContext2D; dpr: number } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const dpr = window.devicePixelRatio || 1;

  const requiredWidth = Math.floor(logicalWidth * dpr);
  const requiredHeight = Math.floor(logicalHeight * dpr);

  if (canvas.width !== requiredWidth || canvas.height !== requiredHeight) {
    canvas.width = requiredWidth;
    canvas.height = requiredHeight;
  }

  // Reset transform and apply DPR scaling (zoom is handled via CSS).
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, dpr };
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  coords: Coords,
  cell: GameCellBase,
  gameDefinition: GameDefinition<GameCellBase> | undefined,
  tileSymbolLookup: Map<string, string> | null,
): void {
  const { x, y } = coords;
  const px = x * CELL_SIZE;
  const py = y * CELL_SIZE;

  // Determine label based on current CC1/non-CC1 logic.
  let label = '·';

  if (gameDefinition?.gameId === 'cc1' && tileSymbolLookup) {
    const cc1Cell = cell as CC1Cell;
    const topCode = cc1Cell.top ?? CC1TileId.FLOOR;
    const tileName = cc1TileIdToName(topCode);
    const symbol = tileSymbolLookup.get(tileName) ?? '■';
    label = symbol;
  } else {
    const hasTop = (cell as { top?: unknown }).top !== undefined;
    label = hasTop ? '■' : '·';
  }

  // Background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

  // Grid border
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

  // Glyph
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${CELL_SIZE * 0.6}px system-ui`;

  ctx.fillText(label, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
}

export const LevelCanvas: React.FC<LevelCanvasProps> = ({
  level,
  selection,
  gameDefinition,
  useEditorStore,
  activeTool,
  overlayProviders,
  overlaysEnabled,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const overlays: OverlayShape[] = (() => {
    if (!flattened || !gameDefinition || gameDefinition.gameId !== 'cc1') {
      return [];
    }
    const asCc1Level = flattened as unknown as GameLevel<CC1Cell>;
    const shapes: OverlayShape[] = [];

    for (const provider of overlayProviders) {
      const enabled = overlaysEnabled[provider.id] ?? false;
      if (!enabled) {
        continue;
      }
      const providerShapes = provider.getOverlays(asCc1Level);
      for (const shape of providerShapes) {
        shapes.push(shape);
      }
    }

    return shapes;
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !flattened) {
      return;
    }

    const { width, height } = flattened.size;
    const logicalWidth = width * CELL_SIZE;
    const logicalHeight = height * CELL_SIZE;

    const sized = setCanvasSize(canvas, logicalWidth, logicalHeight);
    if (!sized) {
      return;
    }
    const { ctx } = sized;

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Basic styles for text drawing.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${CELL_SIZE * 0.6}px system-ui`;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const coords: Coords = { x, y };
        const cell = flattened.grid.get(coords) as GameCellBase;
        drawCell(ctx, coords, cell, gameDefinition, symbolsById);
      }
    }
    if (selection) {
      const selX = selection.x1 * CELL_SIZE;
      const selY = selection.y1 * CELL_SIZE;
      const selWidth = (selection.x2 - selection.x1 + 1) * CELL_SIZE;
      const selHeight = (selection.y2 - selection.y1 + 1) * CELL_SIZE;

      ctx.save();
      ctx.strokeStyle = '#007acc';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // dashed; remove for solid
      ctx.strokeRect(selX, selY, selWidth, selHeight);
      ctx.restore();
    }
    for (const shape of overlays) {
      if (shape.kind === 'label') {
        ctx.save();
        ctx.fillStyle = '#d32f2f';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${CELL_SIZE * 0.6}px system-ui`;

        const cx = shape.coords.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = shape.coords.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillText(shape.text, cx, cy);
        ctx.restore();
        continue;
      }

      if (shape.kind === 'rect') {
        const left = shape.x * CELL_SIZE;
        const top = shape.y * CELL_SIZE;
        const widthPx = shape.width * CELL_SIZE;
        const heightPx = shape.height * CELL_SIZE;

        ctx.save();
        ctx.strokeStyle = shape.stroke ?? '#ff9800';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(left, top, widthPx, heightPx);
        ctx.restore();
        continue;
      }

      if (shape.kind === 'line') {
        const x1 = shape.from.x * CELL_SIZE + CELL_SIZE / 2;
        const y1 = shape.from.y * CELL_SIZE + CELL_SIZE / 2;
        const x2 = shape.to.x * CELL_SIZE + CELL_SIZE / 2;
        const y2 = shape.to.y * CELL_SIZE + CELL_SIZE / 2;

        ctx.save();
        ctx.strokeStyle = shape.stroke ?? '#4caf50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        continue;
      }
    }
  }, [canvasRef, flattened, gameDefinition, symbolsById, selection, overlays]);

  if (!level || !flattened) {
    return <div className="LevelCanvas-empty">No level or game definition available.</div>;
  }

  const runtimeContext: ToolRuntimeContext<CC1Cell> | null =
    activeTool && gameDefinition && gameDefinition.gameId === 'cc1'
      ? createToolRuntimeContext(useEditorStore, gameDefinition as GameDefinition<CC1Cell>)
      : null;

  const { size } = flattened;

  function toKeyModifiers(ev: React.MouseEvent<HTMLCanvasElement>): KeyModifiers {
    return {
      alt: ev.altKey,
      ctrl: ev.ctrlKey,
      meta: ev.metaKey,
      shift: ev.shiftKey,
    };
  }

  function toPointerButton(
    ev: React.MouseEvent<HTMLCanvasElement>,
  ): 'left' | 'middle' | 'right' | 'aux' {
    if (ev.button === 1) return 'middle';
    if (ev.button === 2) return 'right';
    if (ev.button === 0) return 'left';
    return 'aux';
  }

  function toPointerEvent(
    ev: React.MouseEvent<HTMLCanvasElement>,
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
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.1, Math.round((z - 0.1) * 10) / 10))}
        >
          –
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))}
        >
          +
        </button>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={zoom}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (!Number.isNaN(parsed)) {
              setZoom(parsed);
            }
          }}
        />
        <span className="CanvasToolbar-zoomValue">{Math.round(zoom * 100)}%</span>
      </div>

      <div
        className="LevelCanvas-scroll"
        onWheel={(ev) => {
          const zoomModifier = ev.ctrlKey || ev.metaKey;

          if (!zoomModifier) {
            // No modifier → normal scroll, no zoom.
            return;
          }

          // Modifier (Ctrl/Cmd) held → zoom only, no scroll.
          ev.preventDefault();
          ev.stopPropagation();

          const container = ev.currentTarget;
          const prevScrollTop = container.scrollTop;
          const prevScrollLeft = container.scrollLeft;

          const zoomDelta = -ev.deltaY * 0.001; // tune sensitivity
          setZoom((z) => {
            const next = z + zoomDelta;
            const clamped = Math.min(2, Math.max(0.1, next));

            // After React updates layout, restore scroll offset to prevent jump.
            requestAnimationFrame(() => {
              container.scrollTop = prevScrollTop;
              container.scrollLeft = prevScrollLeft;
            });

            return clamped;
          });
        }}
      >
        <div
          className="LevelCanvas-inner"
          style={{
            transform: `scale(${zoom})`,
            width: size.width * CELL_SIZE,
            height: size.height * CELL_SIZE,
          }}
        >
          <canvas
            ref={canvasRef}
            className="LevelCanvas-canvas"
            width={size.width * CELL_SIZE}
            height={size.height * CELL_SIZE}
            style={{
              width: size.width * CELL_SIZE,
              height: size.height * CELL_SIZE,
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
          />
        </div>
      </div>
    </div>
  );
};
