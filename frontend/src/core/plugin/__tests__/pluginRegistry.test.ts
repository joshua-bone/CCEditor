import { describe, it, expect, vi } from 'vitest';
import { createPluginRegistry, createEditorContext } from '../pluginRegistry';
import type { GameDefinition } from '../../game/gameDefinition';
import type { GameCellBase } from '../../model/gameTypes';
import type { ToolDescriptor } from '../toolTypes';
import type { GeneratorDescriptor } from '../generatorTypes';
import type { FileFormatDescriptor } from '../fileFormatTypes';
import type { PanelDescriptor } from '../panelTypes';
import { createCC1GameDefinition } from '../../game/cc1/cc1GameDefinition';
import type { CC1Cell } from '../../game/cc1/cc1Types';

describe('PluginRegistry and EditorContext', () => {
  it('registers tools and exposes them via registry getters', () => {
    const registry = createPluginRegistry<CC1Cell>();

    const cc1Def = createCC1GameDefinition();
    const defs = new Map<string, GameDefinition<GameCellBase>>([
      ['cc1', cc1Def as unknown as GameDefinition<GameCellBase>],
    ]);

    const logSpy = vi.fn();
    const ctx = createEditorContext(registry, defs, logSpy);

    const tool: ToolDescriptor<CC1Cell> = {
      id: 'tool.brush',
      displayName: 'Brush',
      behavior: {},
    };

    ctx.registerTool(tool);

    const allTools = registry.getTools();
    expect(allTools).toHaveLength(1);
    expect(allTools[0]).toBe(tool);
    expect(registry.getTool('tool.brush')).toBe(tool);
  });

  it('registers generators, file formats, and panels', () => {
    const registry = createPluginRegistry<CC1Cell>();

    const cc1Def = createCC1GameDefinition();
    const defs = new Map<string, GameDefinition<GameCellBase>>([
      ['cc1', cc1Def as unknown as GameDefinition<GameCellBase>],
    ]);

    const ctx = createEditorContext(registry, defs);

    const gen: GeneratorDescriptor<CC1Cell> = {
      id: 'generator.noop',
      displayName: 'No-op',
      params: [],
      run() {},
    };

    const fmt: FileFormatDescriptor<CC1Cell> = {
      id: 'file.stub',
      displayName: 'Stub Format',
      filenameExtensions: ['.stub'],
      canRead: true,
      canWrite: false,
      async read() {
        throw new Error('not implemented');
      },
    };

    const panel: PanelDescriptor<CC1Cell> = {
      id: 'panel.stub',
      displayName: 'Stub Panel',
      placement: 'left',
    };

    ctx.registerGenerator(gen);
    ctx.registerFileFormat(fmt);
    ctx.registerPanel(panel);

    expect(registry.getGenerators()).toHaveLength(1);
    expect(registry.getFileFormats()).toHaveLength(1);
    expect(registry.getPanels()).toHaveLength(1);

    expect(registry.getGenerator('generator.noop')).toBe(gen);
    expect(registry.getFileFormat('file.stub')).toBe(fmt);
    expect(registry.getPanel('panel.stub')).toBe(panel);
  });

  it('getGameDefinition returns definitions by gameId', () => {
    const cc1Def = createCC1GameDefinition();
    const defs = new Map<string, GameDefinition<GameCellBase>>([
      ['cc1', cc1Def as unknown as GameDefinition<GameCellBase>],
    ]);

    const registry = createPluginRegistry<CC1Cell>();
    const ctx = createEditorContext(registry, defs);

    const got = ctx.getGameDefinition('cc1');
    expect(got).toBe(cc1Def);
    expect(ctx.getGameDefinition('stub')).toBeUndefined();
  });

  it('log forwards to provided logger', () => {
    const registry = createPluginRegistry<CC1Cell>();
    const defs = new Map<string, GameDefinition<GameCellBase>>();

    const logSpy = vi.fn();
    const ctx = createEditorContext(registry, defs, logSpy);

    ctx.log('hello');
    ctx.log('with-meta', { foo: 42 });

    expect(logSpy).toHaveBeenCalledWith('hello');
    expect(logSpy).toHaveBeenCalledWith('with-meta', { foo: 42 });
  });
});
