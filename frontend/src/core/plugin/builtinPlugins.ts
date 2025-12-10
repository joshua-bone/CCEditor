// frontend/src/core/plugin/builtinPlugins.ts

import { datLayersJsonFileFormat } from './json/datLayersJsonFileFormat';
import { cc1DatFileFormat } from './cc1/cc1DatFileFormat';
import type { Plugin } from './pluginApi';
import type { CC1Cell } from '../game/cc1/cc1Types';
import { createCC1GameDefinition } from '../game/cc1/cc1GameDefinition';

const cc1Def = createCC1GameDefinition();

export const builtinPlugins: Plugin<CC1Cell>[] = [
  {
    id: 'plugin.file.datlayers_json',
    type: 'bundle',
    displayName: 'DAT Layers JSON Plugin',
    activate(ctx) {
      ctx.registerFileFormat(datLayersJsonFileFormat);
    },
  },
  {
    id: 'plugin.file.cc1_dat',
    type: 'bundle',
    displayName: 'CC1 DAT Plugin',
    activate(ctx) {
      ctx.registerFileFormat(cc1DatFileFormat(cc1Def));
    },
  },
];
