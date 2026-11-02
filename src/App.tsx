import React from 'react';
import { useMindMapStore } from './store/mindmapStore';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import SettingsModal from './components/SettingsModal';
import ProjectList from './components/ProjectList';

const App: React.FC = () => {
  const { viewMode, nodes, currentProjectId, isDirty, showEisenhowerMatrix, showSettings } = useMindMapStore();
  const [showProjectList, setShowProjectList] = React.useState(!currentProjectId && nodes.length === 0);

  const handleSelectProject = (projectId: string) => {
    useMindMapStore.getState().loadProject(projectId);
    setShowProjectList(false);
  };

  const handleCreateNew = () => {
    useMindMapStore.getState().createNewProject();
    setShowProjectList(false);
  };

  const handleBackToProjects = () => {
    if (isDirty) {
      if (window.confirm('У вас есть несохранённые изменения. Сохранить?')) {
        useMindMapStore.getState().saveProject();
      }
    }
    setShowProjectList(true);
  };

  if (showProjectList) {
    return <ProjectList onSelectProject={handleSelectProject} onCreateNew={handleCreateNew} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {viewMode.mode !== 'presentation' && (
        <div className="flex items-center">
          <button
            onClick={handleBackToProjects}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Вернуться к списку проектов"
          >📁</button>
          <Toolbar />
        </div>
      )}

      {viewMode.mode === 'presentation' && (
        <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
          <span className="font-semibold">📽️ Режим презентации</span>
          <button
            onClick={() => useMindMapStore.getState().setViewMode({ mode: 'edit' })}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >✏️ Вернуться</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Canvas />
          
          {useMindMapStore.getState().connectingFrom && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
              🔗 Кликните на целевой узел для создания связи
            </div>
          )}

          {useMindMapStore.getState().selectedNodeIds.length >= 2 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
              <span>🔗 Выделено: {useMindMapStore.getState().selectedNodeIds.length}</span>
              <button
                onClick={() => useMindMapStore.getState().connectSelectedNodes()}
                className="px-2 py-0.5 bg-white text-blue-600 rounded text-xs font-medium"
              >Связать</button>
              <button
                onClick={() => useMindMapStore.getState().clearMultiSelect()}
                className="px-2 py-0.5 bg-white/20 rounded text-xs"
              >✕</button>
            </div>
          )}
        </div>

        {viewMode.mode !== 'presentation' && <Sidebar />}
      </div>

      {showEisenhowerMatrix && <EisenhowerMatrix />}
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default App;
