// frontend/src/App.tsx

import './App.css';

import { createEditor } from './core/app/editorBootstrap';
import { EditorRoot } from './ui/EditorRoot';

const editorRuntime = createEditor(); // { useEditorStore, gameDefinitions, ... }

function App() {
  const { useEditorStore, gameDefinitions } = editorRuntime;

  return (
    <div className="AppRoot">
      <EditorRoot useEditorStore={useEditorStore} gameDefinitions={gameDefinitions} />
    </div>
  );
}

export default App;
