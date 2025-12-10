// frontend/src/core/plugin/panelTypes.ts

import type { GameCellBase } from '../model/gameTypes';
import type { Coords } from '../model/types';
import type { GameLevel } from '../model/gameTypes';

// Overlay primitives used by the canvas

export type OverlayShapeKind = 'rect' | 'label' | 'line';

interface OverlayBase {
  id?: string; // optional stable ID
  layerIndex?: number; // draw-order hint
}

export interface OverlayRect extends OverlayBase {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  // Colors are symbolic strings; UI decides how to render.
  stroke?: string;
  fill?: string;
}

export interface OverlayLabel extends OverlayBase {
  kind: 'label';
  coords: Coords;
  text: string;
  align?: 'center' | 'left' | 'right';
}

export interface OverlayLine extends OverlayBase {
  kind: 'line';
  from: Coords;
  to: Coords;
  stroke?: string;
}

export type OverlayShape = OverlayRect | OverlayLabel | OverlayLine;

export interface OverlayProvider<TCell extends GameCellBase = GameCellBase> {
  id: string; // "overlay.monsterOrder"
  label: string; // "Monster Order"
  gameId?: TCell['gameId'] | 'any';

  getOverlays(level: GameLevel<TCell>): OverlayShape[];
}

// Panels

export type PanelPlacement = 'left' | 'right' | 'bottom' | 'modal' | 'overlay';

export interface PanelDescriptor<TCell extends GameCellBase = GameCellBase> {
  id: string; // "panel.generators", "panel.overlays"
  displayName: string; // "Generators", "Overlays"
  placement: PanelPlacement;
  gameId?: TCell['gameId'] | 'any';

  // Optional overlay provider if this panel drives overlays.
  overlayProvider?: OverlayProvider<TCell>;
}
