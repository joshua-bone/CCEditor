import React from 'react';
import './App.css';
import { createEditor } from './core/app/editorBootstrap';
import { EditorRoot } from './ui/EditorRoot';

const editorRuntime = createEditor();

function App() {
  const { useEditorStore } = editorRuntime;

  return (
    <div className="AppRoot">
      <EditorRoot useEditorStore={useEditorStore} />
    </div>
  );
}
export default App;
