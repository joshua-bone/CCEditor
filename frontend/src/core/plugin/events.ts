// frontend/src/core/plugin/events.ts

import type { Coords } from '../model/types';

export interface KeyModifiers {
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export interface KeyEvent {
  key: string; // e.g. "b", "Escape"
  code: string; // e.g. "KeyB", "Escape"
  modifiers: KeyModifiers;
  repeat: boolean;
}

export type PointerButton = 'left' | 'right' | 'middle' | 'aux';

export type PointerEventKind = 'down' | 'move' | 'up';

export interface PointerEvent {
  kind: PointerEventKind;
  button: PointerButton;
  coords: Coords;
  modifiers: KeyModifiers;
}
