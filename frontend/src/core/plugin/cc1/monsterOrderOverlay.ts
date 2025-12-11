import type { OverlayProvider, OverlayShape, OverlayLabel, PanelDescriptor } from '../panelTypes';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import type { GameLevel } from '../../model/gameTypes';
import { isCC1Monster } from '../../game/cc1/cc1TileGroups';

function computeMonsterOrder(level: GameLevel<CC1Cell>): OverlayShape[] {
  const shapes: OverlayShape[] = [];
  const { width, height } = level.size;
  let index = 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = level.grid.get({ x, y });
      const top = cell.top;
      const bottom = cell.bottom;
      const hasMonster =
        (top !== null && isCC1Monster(top)) || (bottom !== null && isCC1Monster(bottom));

      if (hasMonster) {
        const label: OverlayLabel = {
          kind: 'label',
          id: `monster-${x}-${y}`,
          coords: { x, y },
          text: String(index),
          align: 'center',
        };
        shapes.push(label);
        index += 1;
      }
    }
  }

  return shapes;
}

export const monsterOrderOverlayProvider: OverlayProvider<CC1Cell> = {
  id: 'overlay.monsterOrder',
  label: 'Monster Order',
  gameId: 'cc1',

  getOverlays(level: GameLevel<CC1Cell>): OverlayShape[] {
    return computeMonsterOrder(level);
  },
};

export const monsterOrderPanelDescriptor: PanelDescriptor<CC1Cell> = {
  id: 'panel.monsterOrder',
  displayName: 'Monster Order',
  placement: 'right',
  gameId: 'cc1',
  overlayProvider: monsterOrderOverlayProvider,
};
