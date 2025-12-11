import type { ToolDescriptor } from '../toolTypes';
import type { PointerEvent } from '../events';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import type { Coords } from '../../model/types';
import type { SelectionRect } from '../../model/selection';

function makeRect(a: Coords, b: Coords): SelectionRect {
  return {
    x1: Math.min(a.x, b.x),
    y1: Math.min(a.y, b.y),
    x2: Math.max(a.x, b.x),
    y2: Math.max(a.y, b.y),
  };
}

function unionRect(a: SelectionRect, b: SelectionRect): SelectionRect {
  return {
    x1: Math.min(a.x1, b.x1),
    y1: Math.min(a.y1, b.y1),
    x2: Math.max(a.x2, b.x2),
    y2: Math.max(a.y2, b.y2),
  };
}

export const selectionToolDescriptor: ToolDescriptor<CC1Cell> = {
  id: 'tool.selection',
  displayName: 'Selection',
  gameId: 'cc1',
  iconId: 'selection',
  primaryShortcut: 'S',

  behavior: (() => {
    let anchor: Coords | null = null;
    let dragRect: SelectionRect | null = null;

    const reset = (): void => {
      anchor = null;
      dragRect = null;
    };

    return {
      onPointerDown(ctx, ev: PointerEvent): void {
        if (ev.button !== 'left') {
          return;
        }
        anchor = ev.coords;
        dragRect = makeRect(ev.coords, ev.coords);
        ctx.setSelection(dragRect);
      },

      onPointerMove(ctx, ev: PointerEvent): void {
        if (!anchor || ev.button !== 'left') {
          return;
        }
        dragRect = makeRect(anchor, ev.coords);
        const existing = ctx.getSelection();
        const modifiers = ev.modifiers;

        let nextRect: SelectionRect = dragRect;

        if (modifiers.shift && existing) {
          nextRect = unionRect(existing, dragRect);
        }

        ctx.setSelection(nextRect);
      },

      onPointerUp(ctx, ev: PointerEvent): void {
        if (ev.button !== 'left') {
          reset();
          return;
        }

        const modifiers = ev.modifiers;

        if (modifiers.alt) {
          ctx.setSelection(null);
        }

        reset();
      },

      onCancel(): void {
        reset();
      },
    };
  })(),
};
