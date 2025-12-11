import type { GeneratorDescriptor, GeneratorRuntimeContext, ParamSchema } from '../generatorTypes';
import type { CC1Cell } from '../../game/cc1/cc1Types';
import type { Transparent } from '../../model/layers';
import type { Grid } from '../../model/grid';
import type { Coords } from '../../model/types';
import { cc1TileNameToId } from '../../game/cc1/cc1Tiles';

const randomNoiseParams: ParamSchema[] = [
  {
    name: 'tileId',
    label: 'Tile ID',
    kind: 'enum',
    description: 'Which tile to sprinkle into the layer',
    options: [], // we’ll fill from palette in UI instead
  },
  {
    name: 'probability',
    label: 'Probability',
    kind: 'number',
    description: 'Chance (0–1) to apply tile to each cell',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.25,
  },
];

function applyRandomNoiseToGrid(
  grid: Grid<CC1Cell | Transparent>,
  tileId: string,
  probability: number,
  random: () => number,
  region: { topLeft: Coords; bottomRight: Coords } | null,
): Grid<CC1Cell | Transparent> {
  const { size } = grid;
  const topLeft: Coords = region ? region.topLeft : { x: 0, y: 0 };
  const bottomRight: Coords = region
    ? region.bottomRight
    : { x: size.width - 1, y: size.height - 1 };

  const next = grid.map((value, coords) => {
    if (
      coords.x < topLeft.x ||
      coords.x > bottomRight.x ||
      coords.y < topLeft.y ||
      coords.y > bottomRight.y
    ) {
      return value;
    }
    if (random() < probability) {
      const base: CC1Cell =
        value && value !== null ? (value as CC1Cell) : { gameId: 'cc1', top: null, bottom: null };

      return {
        ...base,
        // Apply the chosen tile to the top layer; leave bottom unchanged.
        top: cc1TileNameToId(tileId),
      };
    }
    return value;
  });

  return next;
}

export const randomNoiseGenerator: GeneratorDescriptor<CC1Cell> = {
  id: 'generator.randomNoise',
  displayName: 'Random Noise',
  gameId: 'cc1',
  params: randomNoiseParams,

  async run(ctx: GeneratorRuntimeContext<CC1Cell>, params: Record<string, unknown>): Promise<void> {
    const level = ctx.getCurrentLevel();
    const selection = ctx.getSelection();

    const probabilityValue = params.probability;
    const probability = typeof probabilityValue === 'number' ? probabilityValue : 0.25;

    // tileId: if not passed, fall back to left palette tile.
    let tileId = params.tileId;
    if (typeof tileId !== 'string') {
      const palette = ctx.gameDefinition.getTilePalette();
      if (palette.length > 0) {
        tileId = palette[0].id;
      } else {
        return;
      }
    }

    const region =
      selection !== null
        ? {
            topLeft: { x: selection.x1, y: selection.y1 },
            bottomRight: { x: selection.x2, y: selection.y2 },
          }
        : null;

    ctx.updateLayer(level.activeLayerId, (grid) =>
      applyRandomNoiseToGrid(grid, tileId as string, probability, () => ctx.random(), region),
    );
  },
};
