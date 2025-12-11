// frontend/src/ui/layout/GeneratorsPanel.tsx

import React, { useState, useMemo } from 'react';
import type { GeneratorDescriptor, ParamSchema } from '../../core/plugin/generatorTypes';
import type { CC1Cell } from '../../core/game/cc1/cc1Types';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { EditorStoreState } from '../../core/app/editorStore';
import type { GameDefinition } from '../../core/game/gameDefinition';
import { createGeneratorRuntimeContext } from '../../core/app/generatorRuntime';
import { PluginParamsForm } from '../PluginParamsForm';

interface GeneratorsPanelProps {
  generators: GeneratorDescriptor<CC1Cell>[];
  useEditorStore: UseBoundStore<StoreApi<EditorStoreState<CC1Cell>>>;
  gameDefinition: GameDefinition<CC1Cell> | undefined;
}

export const GeneratorsPanel: React.FC<GeneratorsPanelProps> = ({
  generators,
  useEditorStore,
  gameDefinition,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedGenerator = useMemo(() => {
    if (selectedId === null) {
      return null;
    }
    const found = generators.find((g) => g.id === selectedId);
    return found ?? null;
  }, [selectedId, generators]);

  const effectiveSchemas: ParamSchema[] = useMemo(() => {
    if (!selectedGenerator || !gameDefinition) {
      return [];
    }

    const palette = gameDefinition.getTilePalette();
    return selectedGenerator.params.map((schema) => {
      if (schema.kind === 'enum' && schema.name === 'tileId') {
        return {
          ...schema,
          options: palette.map((tile) => ({
            value: tile.id,
            label: tile.label,
          })),
        };
      }
      return schema;
    });
  }, [selectedGenerator, gameDefinition]);

  if (!gameDefinition) {
    return null;
  }

  const runtime = createGeneratorRuntimeContext(useEditorStore, gameDefinition);

  return (
    <div className="GeneratorsPanel">
      <h2 className="Sidebar-heading">Generators</h2>
      <div className="GeneratorsPanel-body">
        <ul className="GeneratorsPanel-list">
          {generators.map((gen) => {
            const isActive = gen.id === selectedId;
            return (
              <li key={gen.id}>
                <button
                  type="button"
                  className={
                    'GeneratorsPanel-item' + (isActive ? ' GeneratorsPanel-item--active' : '')
                  }
                  onClick={() => setSelectedId(gen.id === selectedId ? null : gen.id)}
                >
                  {gen.displayName}
                </button>
              </li>
            );
          })}
        </ul>
        {selectedGenerator && (
          <div className="GeneratorsPanel-form">
            <PluginParamsForm
              schemas={effectiveSchemas}
              onRun={async (params) => {
                await selectedGenerator.run(runtime, params);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
