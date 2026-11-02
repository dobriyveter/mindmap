import React, { useState } from 'react';
import { useMindMapStore } from '../store/mindmapStore';
import { exportAsJSON, importFromJSON } from '../utils/export';

const Toolbar: React.FC = () => {
  const store = useMindMapStore();

  const handleExportJSON = () => {
    exportAsJSON(store.nodes, store.connections, store.mapTitle);
  };

  const handleImportJSON = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = await importFromJSON(file);
        useMindMapStore.setState({
          nodes: data.nodes,
          connections: data.connections,
          mapTitle: data.title || 'Импортированный проект',
        });
      } catch (err) {
        alert('Ошибка импорта');
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-1 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex items-center gap-2 mr-4">
        <span className="text-2xl">🧠</span>
        <input
          type="text"
          value={store.mapTitle}
          onChange={(e) => store.setMapTitle(e.target.value)}
          className="font-semibold text-lg border-none outline-none bg-transparent hover:bg-gray-100 px-2 py-1 rounded"
        />
        {store.isDirty && <span className="text-orange-500 text-xs">●</span>}
      </div>

      <button
        onClick={() => store.addNode(400 + Math.random() * 100, 300 + Math.random() * 100)}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Добавить узел"
      >
        ➕
      </button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      <button onClick={() => store.saveProject()} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Сохранить проект">
        💾
      </button>
      <button onClick={handleExportJSON} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Экспорт JSON">📤</button>
      <button onClick={handleImportJSON} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Импорт JSON">📥</button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      <button onClick={() => store.setZoom(store.zoom - 0.1)} className="p-2 rounded hover:bg-gray-100 text-gray-600">🔍−</button>
      <button onClick={() => store.setZoom(1)} className="p-2 rounded hover:bg-gray-100 text-gray-600 text-xs">
        {Math.round(store.zoom * 100)}%
      </button>
      <button onClick={() => store.setZoom(store.zoom + 0.1)} className="p-2 rounded hover:bg-gray-100 text-gray-600">🔍+</button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      <button
        onClick={() => store.setViewMode({ mode: 'edit' })}
        className={`p-2 rounded text-sm ${store.viewMode.mode === 'edit' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Редактирование"
      >✏️</button>
      <button
        onClick={() => store.setViewMode({ mode: 'presentation' })}
        className={`p-2 rounded text-sm ${store.viewMode.mode === 'presentation' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Презентация"
      >📽️</button>

      <div className="flex-1" />

      <button
        onClick={() => useMindMapStore.setState({ showEisenhowerMatrix: true })}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Матрица Эйзенхауэра"
      >📊</button>

      <button
        onClick={() => useMindMapStore.setState({ showSettings: true })}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Настройки"
      >⚙️</button>

      {store.selectedNodeIds.length >= 2 ? (
        <button
          onClick={() => store.connectSelectedNodes()}
          className="p-2 rounded text-sm bg-green-100 text-green-700 animate-pulse"
        >
          🔗 Связать ({store.selectedNodeIds.length})
        </button>
      ) : (
        <button
          onClick={() => {
            if (store.selectedNodeId) {
              store.setConnectingFrom(store.selectedNodeId);
            }
          }}
          className={`p-2 rounded text-sm ${store.connectingFrom ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-600'}`}
          disabled={!store.selectedNodeId}
        >🔗</button>
      )}

      {store.lastSaved && (
        <span className="text-xs text-gray-400 ml-2">
          Сохранено: {store.lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default Toolbar;
