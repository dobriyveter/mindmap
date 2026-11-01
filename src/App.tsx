import React from 'react';
import useMindMapStore from './store/mindmapStore';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import TemplateModal from './components/TemplateModal';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const { theme, viewMode } = useMindMapStore();

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Toolbar - hidden in presentation mode */}
      {viewMode.mode !== 'presentation' && <Toolbar />}

      {/* Presentation mode toolbar */}
      {viewMode.mode === 'presentation' && (
        <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
          <span className="font-semibold">📽️ Режим презентации</span>
          <button
            onClick={() => useMindMapStore.getState().setViewMode({ mode: 'edit' })}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            ✏️ Вернуться к редактированию
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas />
          
          {/* Print mode overlay */}
          {viewMode.mode === 'print' && (
            <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                🖨️ Печать
              </button>
              <button
                onClick={() => useMindMapStore.getState().setViewMode({ mode: 'edit' })}
                className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
              >
                ✏️ Назад
              </button>
            </div>
          )}

          {/* Focus mode info */}
          {viewMode.mode === 'focus' && (
            <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">🎯 Режим фокуса</span>
              <button
                onClick={() => useMindMapStore.getState().setViewMode({ mode: 'edit' })}
                className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
              >
                ✕ Выйти
              </button>
            </div>
          )}

          {/* Connecting mode indicator */}
          {useMindMapStore.getState().connectingFrom && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
              🔗 Кликните на целевой узел для создания связи (или на пустое место для отмены)
            </div>
          )}

          {/* Multi-select indicator */}
          {useMindMapStore.getState().selectedNodeIds.length >= 2 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
              <span>🔗 Выделено узлов: {useMindMapStore.getState().selectedNodeIds.length}</span>
              <button
                onClick={() => useMindMapStore.getState().connectSelectedNodes()}
                className="px-2 py-0.5 bg-white text-blue-600 rounded text-xs font-medium hover:bg-blue-50"
              >
                Связать
              </button>
              <button
                onClick={() => useMindMapStore.getState().clearMultiSelect()}
                className="px-2 py-0.5 bg-white/20 rounded text-xs hover:bg-white/30"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - hidden in presentation/print mode */}
        {viewMode.mode !== 'presentation' && viewMode.mode !== 'print' && (
          <Sidebar />
        )}
      </div>

      {/* Modals */}
      <TemplateModal />
      <SettingsModal />
    </div>
  );
};

export default App;
