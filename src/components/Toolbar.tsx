import React from 'react';
import useMindMapStore from '../store/mindmapStore';
import { saveAs } from 'file-saver';
import { exportAsSVG, downloadMarkdown } from '../utils/export';

const Toolbar: React.FC = () => {
  const store = useMindMapStore();

  const handleExportJSON = () => {
    const data = store.exportMap();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${store.mapTitle || 'mindmap'}.json`);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          store.importMap(data);
        } catch (err) {
          alert('Ошибка импорта: неверный формат файла');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = () => {
    store.saveToLocal();
  };

  return (
    <div className="flex items-center gap-1 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      {/* Logo & Title */}
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

      {/* Add node button */}
      <button
        onClick={() => {
          console.log('🎯 Создаём узел через кнопку');
          store.addNode(400 + Math.random() * 100, 300 + Math.random() * 100);
        }}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Добавить узел"
      >
        ➕
      </button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      {/* Undo/Redo */}
      <button
        onClick={() => store.undo()}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Отменить (Ctrl+Z)"
      >
        ↩️
      </button>
      <button
        onClick={() => store.redo()}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Повторить (Ctrl+Y)"
      >
        ↪️
      </button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      {/* Save */}
      <button
        onClick={() => {
          useMindMapStore.getState().saveProject();
          handleSave();
        }}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Сохранить проект (Ctrl+S)"
      >
        💾
      </button>

      {/* Export/Import */}
      <div className="relative group">
        <button className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Экспорт">
          📤
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50 w-44">
          <button onClick={handleExportJSON} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
            📄 Экспорт JSON
          </button>
          <button onClick={() => exportAsSVG(store.nodes, store.connections, store.mapTitle)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
            🖼️ Экспорт SVG
          </button>
          <button onClick={() => downloadMarkdown(store.nodes, store.connections, store.mapTitle)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
            📝 Экспорт Markdown
          </button>
        </div>
      </div>
      <button onClick={handleImportJSON} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Импорт JSON">
        📥
      </button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      {/* Zoom controls */}
      <button onClick={() => store.setZoom(store.zoom - 0.1)} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Уменьшить">
        🔍−
      </button>
      <button onClick={() => store.setZoom(1)} className="p-2 rounded hover:bg-gray-100 text-gray-600 text-xs" title="Сбросить масштаб">
        {Math.round(store.zoom * 100)}%
      </button>
      <button onClick={() => store.setZoom(store.zoom + 0.1)} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Увеличить">
        🔍+
      </button>

      <div className="h-6 w-px bg-gray-200 mx-2" />

      {/* View modes */}
      <button
        onClick={() => store.setViewMode({ mode: 'edit' })}
        className={`p-2 rounded text-sm ${store.viewMode.mode === 'edit' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Режим редактирования"
      >
        ✏️
      </button>
      <button
        onClick={() => {
          const selectedId = store.selectedNodeId;
          store.setViewMode({ mode: 'focus', focusNodeId: selectedId || undefined });
        }}
        className={`p-2 rounded text-sm ${store.viewMode.mode === 'focus' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Фокус на ветке"
      >
        🎯
      </button>
      <button
        onClick={() => store.setViewMode({ mode: 'presentation' })}
        className={`p-2 rounded text-sm ${store.viewMode.mode === 'presentation' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Презентация"
      >
        📽️
      </button>
      <button
        onClick={() => store.setViewMode({ mode: 'print' })}
        className={`p-2 rounded text-sm ${store.viewMode.mode === 'print' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Печать"
      >
        🖨️
      </button>

      <div className="flex-1" />

      {/* Eisenhower Matrix */}
      <button
        onClick={() => useMindMapStore.setState({ showEisenhowerMatrix: true })}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Матрица Эйзенхауэра"
      >
        📊
      </button>

      {/* Templates */}
      <button
        onClick={() => store.setShowTemplates(true)}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Шаблоны"
      >
        📋
      </button>

      {/* Settings */}
      <button
        onClick={() => store.setShowSettings(true)}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Настройки"
      >
        ⚙️
      </button>

      {/* Connect mode - для связи между любыми узлами */}
      {store.selectedNodeIds.length >= 2 ? (
        <button
          onClick={() => store.connectSelectedNodes()}
          className="p-2 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200 animate-pulse"
          title={`Создать связь между ${store.selectedNodeIds.length} узлами`}
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
          title={store.connectingFrom ? 'Кликните на целевой узел' : 'Создать связь (выделите узел)'}
          disabled={!store.selectedNodeId}
        >
          🔗
        </button>
      )}

      {/* Status */}
      {store.lastSaved && (
        <span className="text-xs text-gray-400 ml-2">
          Сохранено: {store.lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default Toolbar;
