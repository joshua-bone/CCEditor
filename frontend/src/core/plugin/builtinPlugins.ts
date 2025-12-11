// frontend/src/core/plugin/builtinPlugins.ts

import type { Plugin } from './pluginApi';
import type { CC1Cell } from '../game/cc1/cc1Types';
import { datLayersJsonFileFormat } from './cc1/datLayersJsonFileFormat';
import { cc1DatFileFormat } from './cc1/datFileFormat';
import { createCC1GameDefinition } from '../game/cc1/cc1GameDefinition';
import { brushToolDescriptor } from './cc1/brushToolPlugin';
import { lineToolDescriptor } from './cc1/lineToolPlugin';
import { rectToolDescriptor, ovalToolDescriptor } from './cc1/rectOvalToolPlugin';
import { selectionToolDescriptor } from './cc1/selectionToolPlugin';

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
  {
    id: 'plugin.tools.brush',
    type: 'bundle',
    displayName: 'Brush Tool',
    activate(ctx) {
      ctx.registerTool(brushToolDescriptor);
    },
  },
  {
    id: 'plugin.tools.line',
    type: 'bundle',
    displayName: 'Line Tool',
    activate(ctx) {
      ctx.registerTool(lineToolDescriptor);
    },
  },
  {
    id: 'plugin.tools.rectOval',
    type: 'bundle',
    displayName: 'Rectangle & Oval Tools',
    activate(ctx) {
      ctx.registerTool(rectToolDescriptor);
      ctx.registerTool(ovalToolDescriptor);
    },
  },
  {
    id: 'plugin.tools.selection',
    type: 'bundle',
    displayName: 'Selection Tool',
    activate(ctx) {
      ctx.registerTool(selectionToolDescriptor);
    },
  },
];
