import type { ToolDescriptor, ToolRuntimeContext } from '../toolTypes';
import type { PointerEvent } from '../events';
import type { Coords } from '../../model/types';
import type { CC1Cell } from '../../game/cc1/cc1Types';

function coordsEqual(a: Coords, b: Coords): boolean {
  return a.x === b.x && a.y === b.y;
}

function lineBetween(a: Coords, b: Coords): Coords[] {
  if (coordsEqual(a, b)) {
    return [];
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const points: Coords[] = [];

  for (let i = 1; i <= steps; i += 1) {
    const x = a.x + Math.round((dx * i) / steps);
    const y = a.y + Math.round((dy * i) / steps);
    points.push({ x, y });
  }

  return points;
}

export const brushToolDescriptor: ToolDescriptor<CC1Cell> = {
  id: 'tool.brush',
  displayName: 'Brush',
  gameId: 'cc1',
  iconId: 'brush',
  primaryShortcut: 'B',

  behavior: (() => {
    let isDrawing = false;
    let currentButton: 'left' | 'right' | null = null;
    let lastCoords: Coords | null = null;
    let tileIdForStroke: string | null = null;

    const pickTileId = (
      ctx: ToolRuntimeContext<CC1Cell>,
      button: 'left' | 'right',
    ): string | null => {
      const palette = ctx.getPaletteSelection();
      const candidate = button === 'left' ? palette.leftTileId : palette.rightTileId;
      if (candidate) return candidate;

      const first = ctx.gameDefinition.getTilePalette()[0];
      return first ? first.id : null;
    };

    const startStroke = (ctx: ToolRuntimeContext<CC1Cell>, ev: PointerEvent): void => {
      if (ev.button !== 'left' && ev.button !== 'right') {
        return;
      }

      const tileId = pickTileId(ctx, ev.button);
      if (!tileId) {
        return;
      }

      isDrawing = true;
      currentButton = ev.button;
      lastCoords = ev.coords;
      tileIdForStroke = tileId;

      ctx.paintStroke([ev.coords], tileId, ev.button);
    };

    const continueStroke = (ctx: ToolRuntimeContext<CC1Cell>, ev: PointerEvent): void => {
      if (!isDrawing || !tileIdForStroke || !currentButton) {
        return;
      }
      if (!lastCoords) {
        lastCoords = ev.coords;
        ctx.paintStroke([ev.coords], tileIdForStroke, currentButton);
        return;
      }

      const segmentPoints = lineBetween(lastCoords, ev.coords);
      if (segmentPoints.length === 0) {
        return;
      }

      ctx.paintStroke(segmentPoints, tileIdForStroke, currentButton);
      lastCoords = ev.coords;
    };

    const endStroke = (): void => {
      if (!isDrawing) {
        return;
      }
      isDrawing = false;
      currentButton = null;
      lastCoords = null;
      tileIdForStroke = null;
    };

    return {
      onPointerDown(ctx: ToolRuntimeContext<CC1Cell>, ev: PointerEvent): void {
        startStroke(ctx, ev);
      },

      onPointerMove(ctx: ToolRuntimeContext<CC1Cell>, ev: PointerEvent): void {
        continueStroke(ctx, ev);
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onPointerUp(_ctx: ToolRuntimeContext<CC1Cell>, _ev: PointerEvent): void {
        endStroke();
      },

      onCancel(): void {
        endStroke();
      },
    };
  })(),
};
