import React, { useState } from 'react';
import type {
  ParamSchema,
  NumberParamSchema,
  BooleanParamSchema,
  EnumParamSchema,
} from '../core/plugin/generatorTypes';

type ParamsState = Record<string, unknown>;

interface PluginParamsFormProps {
  schemas: ParamSchema[];
  initialParams?: ParamsState;
  onRun(params: ParamsState): void;
  onCancel?: () => void;
}

export const PluginParamsForm: React.FC<PluginParamsFormProps> = ({
  schemas,
  initialParams,
  onRun,
  onCancel,
}) => {
  const [values, setValues] = useState<ParamsState>(() => {
    const base: ParamsState = {};
    for (const schema of schemas) {
      const key = schema.name;
      const existing = initialParams?.[key];
      if (existing !== undefined) {
        base[key] = existing;
      } else if ('defaultValue' in schema && schema.defaultValue !== undefined) {
        base[key] = schema.defaultValue;
      } else {
        base[key] = schema.kind === 'boolean' ? false : '';
      }
    }
    return base;
  });

  const handleNumberChange = (schema: NumberParamSchema, value: string) => {
    const parsed = value === '' ? undefined : Number(value);
    if (parsed === undefined || Number.isNaN(parsed)) {
      setValues((prev) => ({ ...prev, [schema.name]: undefined }));
      return;
    }
    setValues((prev) => ({ ...prev, [schema.name]: parsed }));
  };

  const handleBooleanChange = (schema: BooleanParamSchema, checked: boolean) => {
    setValues((prev) => ({ ...prev, [schema.name]: checked }));
  };

  const handleEnumChange = (schema: EnumParamSchema, value: string) => {
    setValues((prev) => ({ ...prev, [schema.name]: value }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    onRun(values);
  };

  return (
    <form className="PluginParamsForm" onSubmit={handleSubmit}>
      {schemas.map((schema) => {
        if (schema.kind === 'number') {
          const value = values[schema.name];
          return (
            <label key={schema.name} className="PluginParamsForm-field">
              <span className="PluginParamsForm-label">{schema.label}</span>
              <input
                type="number"
                value={typeof value === 'number' ? String(value) : ''}
                min={schema.min}
                max={schema.max}
                step={schema.step}
                onChange={(e) => handleNumberChange(schema, e.target.value)}
              />
            </label>
          );
        }
        if (schema.kind === 'boolean') {
          const value = values[schema.name];
          return (
            <label key={schema.name} className="PluginParamsForm-field">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleBooleanChange(schema, e.target.checked)}
              />
              <span className="PluginParamsForm-label">{schema.label}</span>
            </label>
          );
        }
        // enum
        const enumSchema = schema;
        const value = values[enumSchema.name];
        return (
          <label key={enumSchema.name} className="PluginParamsForm-field">
            <span className="PluginParamsForm-label">{enumSchema.label}</span>
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => handleEnumChange(enumSchema, e.target.value)}
            >
              <option value="">(choose)</option>
              {enumSchema.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      <div className="PluginParamsForm-buttons">
        <button type="submit">Run</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
