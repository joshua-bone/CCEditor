import type { ToolDescriptor, ToolRuntimeContext } from '../toolTypes';
import type { Coords } from '../../model/types';
import type { CC1Cell } from '../../game/cc1/cc1Types';

function pickTileId(ctx: ToolRuntimeContext<CC1Cell>, button: 'left' | 'right'): string | null {
  const palette = ctx.getPaletteSelection();
  const candidate = button === 'left' ? palette.leftTileId : palette.rightTileId;
  if (candidate) return candidate;

  const first = ctx.gameDefinition.getTilePalette()[0];
  return first ? first.id : null;
}

export const lineToolDescriptor: ToolDescriptor<CC1Cell> = {
  id: 'tool.line',
  displayName: 'Line',
  gameId: 'cc1',
  iconId: 'line',
  primaryShortcut: 'L',

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
        tileId = pickTileId(ctx, ev.button);
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onPointerMove(_ctx, _ev) {
        // Optional: preview line; we can skip for TS20.
      },

      onPointerUp(ctx, ev) {
        if (!anchor || !button || !tileId) {
          reset();
          return;
        }
        // Use the button that started the stroke, ignore other buttons.
        if (ev.button !== button) {
          return;
        }
        ctx.paintLine(anchor, ev.coords, tileId, button);
        reset();
      },

      onCancel() {
        reset();
      },
    };
  })(),
};
