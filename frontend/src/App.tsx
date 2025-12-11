// frontend/src/App.tsx

import './App.css';

import { createEditor } from './core/app/editorBootstrap';
import { builtinPlugins } from './core/plugin/builtinPlugins';
import { EditorRoot } from './ui/EditorRoot';

const editorRuntime = createEditor(builtinPlugins); // { useEditorStore, gameDefinitions, ... }

function App() {
  const { useEditorStore, gameDefinitions, pluginRegistry } = editorRuntime;

  return (
    <div className="AppRoot">
      <EditorRoot
        useEditorStore={useEditorStore}
        gameDefinitions={gameDefinitions}
        pluginRegistry={pluginRegistry}
      />
    </div>
  );
}

export default App;
