// frontend/src/core/plugin/toolTypes.ts

import type { GameCellBase } from '../model/gameTypes';
import type { Coords } from '../model/types';
import type { SelectionRect } from '../model/selection';
import type { LevelWithLayers } from '../model/layers';
import type { LayerClipboard } from '../model/clipboard';
import type { GameDefinition } from '../game/gameDefinition';
import type { KeyEvent, PointerEvent } from './events';
import type { PaletteSelection } from '../app/editorState';

export interface ToolRuntimeContext<TCell extends GameCellBase = GameCellBase> {
  readonly gameDefinition: GameDefinition<TCell>;

  getCurrentLevel(): LevelWithLayers<TCell>;
  getSelection(): SelectionRect | null;
  getPaletteSelection(): PaletteSelection;
  getClipboard(): LayerClipboard<TCell> | null;

  paintStroke(
    points: Coords[],
    tileId: string,
    button: 'left' | 'right',
    mode?: 'normal' | 'bury',
  ): void;

  /**
   * Convenience helpers built on top of paintStroke.
   */
  paintLine(
    from: Coords,
    to: Coords,
    tileId: string,
    button: 'left' | 'right',
    mode?: 'normal' | 'bury',
  ): void;

  fillRect(
    rect: SelectionRect,
    tileId: string,
    button: 'left' | 'right',
    mode?: 'normal' | 'bury',
  ): void;

  setSelection(rect: SelectionRect | null): void;
  copySelectionToClipboard(): void;
  pasteClipboardAt(anchor: Coords): void;
  newLayerFromSelection(newLayerName?: string): void;
}

export interface ToolBehavior<TCell extends GameCellBase = GameCellBase> {
  onPointerDown?(ctx: ToolRuntimeContext<TCell>, ev: PointerEvent): void;
  onPointerMove?(ctx: ToolRuntimeContext<TCell>, ev: PointerEvent): void;
  onPointerUp?(ctx: ToolRuntimeContext<TCell>, ev: PointerEvent): void;
  onKeyDown?(ctx: ToolRuntimeContext<TCell>, ev: KeyEvent): void;
  onCancel?(ctx: ToolRuntimeContext<TCell>): void;
}

export interface ToolDescriptor<TCell extends GameCellBase = GameCellBase> {
  id: string; // "tool.brush", "tool.selection", etc.
  displayName: string; // "Brush", "Selection"
  gameId?: TCell['gameId'] | 'any';
  iconId?: string; // UI can interpret this later
  primaryShortcut?: string; // e.g. "B", "Shift+R"
  behavior: ToolBehavior<TCell>;
}
