import type { ToolDescriptor, ToolRuntimeContext } from '../toolTypes';
import type { Coords } from '../../model/types';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import type { SelectionRect } from '../../model/selection';
import { ellipseOutlinePoints } from '../../app/paintGeometry';

function pickRectTileId(ctx: ToolRuntimeContext<CC1Cell>, button: 'left' | 'right'): string | null {
  const palette = ctx.getPaletteSelection();
  const candidate = button === 'left' ? palette.leftTileId : palette.rightTileId;
  if (candidate) return candidate;

  const first = ctx.gameDefinition.getTilePalette()[0];
  return first ? first.id : null;
}

function toSelectionRect(a: Coords, b: Coords): SelectionRect {
  return {
    x1: Math.min(a.x, b.x),
    y1: Math.min(a.y, b.y),
    x2: Math.max(a.x, b.x),
    y2: Math.max(a.y, b.y),
  };
}

export const rectToolDescriptor: ToolDescriptor<CC1Cell> = {
  id: 'tool.rect',
  displayName: 'Rectangle',
  gameId: 'cc1',
  iconId: 'rect',
  primaryShortcut: 'R',

  behavior: (() => {
    let anchor: Coords | null = null;
    let button: 'left' | 'right' | null = null;
    let tileId: string | null = null;

    const reset = (): void => {
      anchor = null;
      button = null;
      tileId = null;
    };

    return {
      onPointerDown(ctx, ev) {
        if (ev.button !== 'left' && ev.button !== 'right') {
          return;
        }
        anchor = ev.coords;
        button = ev.button;
        tileId = pickRectTileId(ctx, ev.button);
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onPointerMove(_ctx, _ev) {
        // Optional: preview rectangle.
      },

      onPointerUp(ctx, ev) {
        if (!anchor || !button || !tileId) {
          reset();
          return;
        }
        if (ev.button !== button) {
          return;
        }

        const rect = toSelectionRect(anchor, ev.coords);
        const isOutline = ev.modifiers.shift || button === 'right';

        if (isOutline) {
          // Outline: use rectOutlinePoints via paintStroke.
          const topLeft: Coords = { x: rect.x1, y: rect.y1 };
          const bottomRight: Coords = { x: rect.x2, y: rect.y2 };
          const outline = ellipseOutlinePoints(topLeft, bottomRight); // or rectOutlinePoints; swap as desired
          ctx.paintStroke(outline, tileId, button);
        } else {
          // Filled rectangle
          ctx.fillRect(rect, tileId, button);
        }

        reset();
      },

      onCancel() {
        reset();
      },
    };
  })(),
};

export const ovalToolDescriptor: ToolDescriptor<CC1Cell> = {
  id: 'tool.oval',
  displayName: 'Oval',
  gameId: 'cc1',
  iconId: 'oval',
  primaryShortcut: 'O',

  behavior: (() => {
    let anchor: Coords | null = null;
    let button: 'left' | 'right' | null = null;
    let tileId: string | null = null;

    const reset = (): void => {
      anchor = null;
      button = null;
      tileId = null;
    };

    return {
      onPointerDown(ctx, ev) {
        if (ev.button !== 'left' && ev.button !== 'right') {
          return;
        }
        anchor = ev.coords;
        button = ev.button;
        tileId = pickRectTileId(ctx, ev.button);
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onPointerMove(_ctx, _ev) {
        // Optional: preview ellipse.
      },

      onPointerUp(ctx, ev) {
        if (!anchor || !button || !tileId) {
          reset();
          return;
        }
        if (ev.button !== button) {
          return;
        }

        const rect = toSelectionRect(anchor, ev.coords);
        const topLeft: Coords = { x: rect.x1, y: rect.y1 };
        const bottomRight: Coords = { x: rect.x2, y: rect.y2 };
        const outline = ellipseOutlinePoints(topLeft, bottomRight);

        ctx.paintStroke(outline, tileId, button);

        reset();
      },

      onCancel() {
        reset();
      },
    };
  })(),
};
