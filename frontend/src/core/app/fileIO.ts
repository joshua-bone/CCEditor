// frontend/src/core/app/fileIO.ts

import type { EditorRuntime } from './editorBootstrap';
import type { CC1Cell } from '../game/cc1/cc1Types';
import type { LevelsetWithLayers } from '../plugin/fileFormatTypes';
import { createEditorStateFromLevelset } from './editorState'; // we’ll add this helper

// Helper to derive extension (e.g., ".datlayers.json")
function getExtension(filename: string): string {
  const idx = filename.indexOf('.');
  if (idx === -1) return '';
  return filename.slice(filename.indexOf('.', idx));
}

export async function openProjectFromFile(
  file: File,
  runtime: EditorRuntime<CC1Cell>,
): Promise<void> {
  const ext = getExtension(file.name).toLowerCase();
  const formats = runtime.pluginRegistry.getFileFormatsForExtension(ext);
  const fmt = formats[0];

  if (!fmt || !fmt.read) {
    console.error('No reader for file extension', ext);
    alert(`No reader for files with extension ${ext}`);
    return;
  }

  const text = await file.text();
  let levelset: LevelsetWithLayers<CC1Cell>;
  try {
    levelset = (await fmt.read(text)) as LevelsetWithLayers<CC1Cell>;
  } catch (err) {
    console.error('Failed to open project', err);
    alert('Failed to open project: ' + (err as Error).message);
    return;
  }

  const cc1Def = runtime.gameDefinitions.get('cc1');
  if (!cc1Def) {
    console.error('No CC1 game definition found');
    return;
  }

  const state = createEditorStateFromLevelset(cc1Def, levelset);
  runtime.useEditorStore.getState().loadStateFromProject(state);
}

export async function saveProjectToFile(runtime: EditorRuntime<CC1Cell>): Promise<void> {
  const state = runtime.useEditorStore.getState().history.present;
  const levelset = state.levelset;

  const ext = '.datlayers.json';
  const formats = runtime.pluginRegistry.getFileFormatsForExtension(ext);
  const fmt = formats[0];

  if (!fmt || !fmt.write) {
    console.error('No writer for', ext);
    alert(`No writer for ${ext}`);
    return;
  }

  let content: string;
  try {
    content = (await fmt.write(levelset)) as string;
  } catch (err) {
    console.error('Failed to save project', err);
    alert('Failed to save project: ' + (err as Error).message);
    return;
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.projectId || 'project'}.datlayers.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
