import type { GameCellBase } from '../model/gameTypes';
import type { GameDefinition } from '../game/gameDefinition';
import type { ToolDescriptor } from './toolTypes';
import type { GeneratorDescriptor } from './generatorTypes';
import type { FileFormatDescriptor } from './fileFormatTypes';
import type { PanelDescriptor } from './panelTypes';
import type { EditorContext } from './pluginApi';

export interface PluginRegistry<TCell extends GameCellBase = GameCellBase> {
  readonly tools: Map<string, ToolDescriptor<TCell>>;
  readonly generators: Map<string, GeneratorDescriptor<TCell>>;
  readonly fileFormats: Map<string, FileFormatDescriptor<TCell>>;
  readonly panels: Map<string, PanelDescriptor<TCell>>;

  // Query helpers (UI will use these)
  getTool(id: string): ToolDescriptor<TCell> | undefined;
  getTools(): ToolDescriptor<TCell>[];

  getGenerator(id: string): GeneratorDescriptor<TCell> | undefined;
  getGenerators(): GeneratorDescriptor<TCell>[];

  getFileFormat(id: string): FileFormatDescriptor<TCell> | undefined;
  getFileFormats(): FileFormatDescriptor<TCell>[];
  getFileFormatsForExtension(ext: string): FileFormatDescriptor<TCell>[];

  getPanel(id: string): PanelDescriptor<TCell> | undefined;
  getPanels(): PanelDescriptor<TCell>[];
}
export function createPluginRegistry<
  TCell extends GameCellBase = GameCellBase,
>(): PluginRegistry<TCell> {
  const tools = new Map<string, ToolDescriptor<TCell>>();
  const generators = new Map<string, GeneratorDescriptor<TCell>>();
  const fileFormats = new Map<string, FileFormatDescriptor<TCell>>();
  const panels = new Map<string, PanelDescriptor<TCell>>();

  const registry: PluginRegistry<TCell> = {
    tools,
    generators,
    fileFormats,
    panels,

    getTool(id) {
      return tools.get(id);
    },
    getTools() {
      return Array.from(tools.values());
    },

    getGenerator(id) {
      return generators.get(id);
    },
    getGenerators() {
      return Array.from(generators.values());
    },

    getFileFormat(id) {
      return fileFormats.get(id);
    },
    getFileFormats() {
      return Array.from(fileFormats.values());
    },
    getFileFormatsForExtension(ext: string) {
      return Array.from(fileFormats.values()).filter((fmt) => fmt.filenameExtensions.includes(ext));
    },

    getPanel(id) {
      return panels.get(id);
    },
    getPanels() {
      return Array.from(panels.values());
    },
  };

  return registry;
}
export type GameDefinitionMap =
  | ReadonlyMap<string, GameDefinition<GameCellBase>>
  | {
      [gameId: string]: GameDefinition<GameCellBase>;
    };

function getFromDefMap(
  defs: GameDefinitionMap,
  gameId: string,
): GameDefinition<GameCellBase> | undefined {
  if (defs instanceof Map) {
    return defs.get(gameId);
  }
  return (defs as Record<string, GameDefinition<GameCellBase>>)[gameId];
}
export function createEditorContext<TCell extends GameCellBase = GameCellBase>(
  registry: PluginRegistry<TCell>,
  gameDefinitions: GameDefinitionMap,
  logger: (message: string, meta?: unknown) => void = console.log,
): EditorContext<TCell> {
  const ctx: EditorContext<TCell> = {
    registerTool(descriptor) {
      if (registry.tools.has(descriptor.id)) {
        logger(`Tool with id '${descriptor.id}' already registered; overwriting.`);
      }
      registry.tools.set(descriptor.id, descriptor);
    },

    registerGenerator(descriptor) {
      if (registry.generators.has(descriptor.id)) {
        logger(`Generator with id '${descriptor.id}' already registered; overwriting.`);
      }
      registry.generators.set(descriptor.id, descriptor);
    },

    registerFileFormat(descriptor) {
      if (registry.fileFormats.has(descriptor.id)) {
        logger(`File format with id '${descriptor.id}' already registered; overwriting.`);
      }
      registry.fileFormats.set(descriptor.id, descriptor);
    },

    registerPanel(descriptor) {
      if (registry.panels.has(descriptor.id)) {
        logger(`Panel with id '${descriptor.id}' already registered; overwriting.`);
      }
      registry.panels.set(descriptor.id, descriptor);
    },

    log(message: string, meta?: unknown) {
      if (meta !== undefined) {
        logger(message, meta);
      } else {
        logger(message);
      }
    },

    getGameDefinition(gameId: string) {
      return getFromDefMap(gameDefinitions, gameId);
    },
  };

  return ctx;
}
