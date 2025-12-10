// frontend/src/core/plugin/builtinPlugins.ts

import type { Plugin } from './pluginApi';
import type { CC1Cell } from '../game/cc1/cc1Types';
import { datLayersJsonFileFormat } from './json/datLayersJsonFileFormat';

export const builtinPlugins: Plugin<CC1Cell>[] = [
  {
    id: 'plugin.file.datlayers_json',
    type: 'bundle',
    displayName: 'DAT Layers JSON Plugin',
    activate(ctx) {
      ctx.registerFileFormat(datLayersJsonFileFormat);
    },
  },
];
