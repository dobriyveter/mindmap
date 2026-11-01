import React, { useState } from 'react';
import useMindMapStore from '../store/mindmapStore';

const COLORS = [
  '#e8f4f8', '#fef3c7', '#fce7f3', '#e0f2fe', '#d1fae5',
  '#ede9fe', '#fee2e2', '#f0fdf4', '#fff7ed', '#f5f3ff',
  '#ffffff', '#1f2937', '#374151', '#6b7280',
];

const SHAPES: Array<{ value: 'rectangle' | 'rounded' | 'ellipse' | 'diamond'; label: string; icon: string }> = [
  { value: 'rounded', label: 'Скруглённый', icon: '⬜' },
  { value: 'rectangle', label: 'Прямоугольник', icon: '▬' },
  { value: 'ellipse', label: 'Эллипс', icon: '⬭' },
  { value: 'diamond', label: 'Ромб', icon: '◆' },
];

const Sidebar: React.FC = () => {
  const {
    nodes, connections, selectedNodeId, selectedConnectionId,
    updateNode, deleteNode, addNode, addWebLink, removeWebLink,
    addChecklistItem, updateChecklistItem, deleteChecklistItem,
    addObsidianLink, removeObsidianLink, obsidianVaultPath,
    setConnectingFrom, connectingFrom,
  } = useMindMapStore();

  const [newLink, setNewLink] = useState('');
  const [newObsidianNote, setNewObsidianNote] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  const handleAddChild = () => {
    if (!selectedNode) return;
    const childX = selectedNode.x + selectedNode.width + 50;
    const childY = selectedNode.y;
    const childId = addNode(childX, childY, selectedNode.id);
    // Auto-connect
    useMindMapStore.getState().addConnection(selectedNode.id, childId);
  };

  const handleAddWebLink = () => {
    if (!selectedNodeId || !newLink.trim()) return;
    addWebLink(selectedNodeId, newLink.trim());
    setNewLink('');
  };

  const handleAddObsidianLink = () => {
    if (!selectedNodeId || !newObsidianNote.trim()) return;
    addObsidianLink(selectedNodeId, { vaultPath: obsidianVaultPath, noteName: newObsidianNote.trim() });
    setNewObsidianNote('');
  };

  if (!selectedNode && !selectedConnection) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-3">Свойства</h3>
        <p className="text-sm text-gray-500">
          Выберите узел или связь для редактирования свойств.
        </p>
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-2">💡 Подсказки:</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Двойной клик на пустом месте — новый узел</li>
            <li>• Двойной клик на узле — редактирование</li>
            <li>• Delete — удалить узел</li>
            <li>• Ctrl+Z/Y — отмена/повтор</li>
            <li>• Ctrl+D — дублировать узел</li>
            <li>• Колёсико мыши — масштаб</li>
          </ul>
        </div>
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-700 font-medium mb-2">📊 Статистика:</p>
          <p className="text-xs text-purple-600">Узлов: {nodes.length}</p>
          <p className="text-xs text-purple-600">Связей: {connections.length}</p>
        </div>
      </div>
    );
  }

  if (selectedConnection) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Связь</h3>
          <button
            onClick={() => useMindMapStore.getState().deleteConnection(selectedConnection.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            🗑️ Удалить
          </button>
        </div>
        
        <label className="block text-sm font-medium text-gray-600 mb-1">Метка связи</label>
        <input
          type="text"
          value={selectedConnection.label || ''}
          onChange={(e) => {
            const conns = useMindMapStore.getState().connections;
            const idx = conns.findIndex(c => c.id === selectedConnection.id);
            if (idx !== -1) {
              const updated = [...conns];
              updated[idx] = { ...updated[idx], label: e.target.value };
              useMindMapStore.setState({ connections: updated, isDirty: true });
            }
          }}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Название связи..."
        />

        <label className="block text-sm font-medium text-gray-600 mt-3 mb-1">Стиль линии</label>
        <select
          value={selectedConnection.style || 'solid'}
          onChange={(e) => {
            const conns = useMindMapStore.getState().connections;
            const idx = conns.findIndex(c => c.id === selectedConnection.id);
            if (idx !== -1) {
              const updated = [...conns];
              updated[idx] = { ...updated[idx], style: e.target.value as 'solid' | 'dashed' | 'dotted' };
              useMindMapStore.setState({ connections: updated, isDirty: true });
            }
          }}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="solid">Сплошная</option>
          <option value="dashed">Пунктирная</option>
          <option value="dotted">Точечная</option>
        </select>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Свойства узла</h3>
        <button onClick={() => deleteNode(selectedNode!.id)} className="text-red-500 hover:text-red-700 text-sm">
          🗑️
        </button>
      </div>

      {/* Text */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Текст</label>
      <textarea
        value={selectedNode!.text}
        onChange={(e) => updateNode(selectedNode!.id, { text: e.target.value })}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-3"
        rows={2}
      />

      {/* Background color */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Цвет фона</label>
      <div className="flex flex-wrap gap-1 mb-3">
        {COLORS.map(color => (
          <button
            key={color}
            onClick={() => updateNode(selectedNode!.id, { backgroundColor: color })}
            className={`w-6 h-6 rounded border ${selectedNode!.backgroundColor === color ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Text color */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Цвет текста</label>
      <input
        type="color"
        value={selectedNode!.color}
        onChange={(e) => updateNode(selectedNode!.id, { color: e.target.value })}
        className="w-full h-8 rounded border border-gray-300 mb-3"
      />

      {/* Font size */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Размер шрифта: {selectedNode!.fontSize}px</label>
      <input
        type="range"
        min="10"
        max="32"
        value={selectedNode!.fontSize}
        onChange={(e) => updateNode(selectedNode!.id, { fontSize: parseInt(e.target.value) })}
        className="w-full mb-3"
      />

      {/* Font weight */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Жирность</label>
      <select
        value={selectedNode!.fontWeight}
        onChange={(e) => updateNode(selectedNode!.id, { fontWeight: e.target.value })}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-3"
      >
        <option value="normal">Обычный</option>
        <option value="bold">Жирный</option>
        <option value="light">Тонкий</option>
      </select>

      {/* Shape */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Форма</label>
      <div className="flex gap-1 mb-3">
        {SHAPES.map(shape => (
          <button
            key={shape.value}
            onClick={() => updateNode(selectedNode!.id, { shape: shape.value })}
            className={`flex-1 py-1 text-center rounded border text-sm ${
              selectedNode!.shape === shape.value ? 'bg-blue-100 border-blue-300' : 'border-gray-300 hover:bg-gray-50'
            }`}
            title={shape.label}
          >
            {shape.icon}
          </button>
        ))}
      </div>

      {/* Size */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500">Ширина</label>
          <input
            type="number"
            value={selectedNode!.width}
            onChange={(e) => updateNode(selectedNode!.id, { width: parseInt(e.target.value) || 100 })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500">Высота</label>
          <input
            type="number"
            value={selectedNode!.height}
            onChange={(e) => updateNode(selectedNode!.id, { height: parseInt(e.target.value) || 50 })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Image URL */}
      <label className="block text-sm font-medium text-gray-600 mb-1">URL изображения</label>
      <input
        type="text"
        value={selectedNode!.imageUrl || ''}
        onChange={(e) => updateNode(selectedNode!.id, { imageUrl: e.target.value || undefined })}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-3"
        placeholder="https://..."
      />

      {/* Notes */}
      <label className="block text-sm font-medium text-gray-600 mb-1">Заметки</label>
      <textarea
        value={selectedNode!.notes || ''}
        onChange={(e) => updateNode(selectedNode!.id, { notes: e.target.value })}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-3"
        rows={3}
        placeholder="Дополнительные заметки..."
      />

      {/* Web Links */}
      <div className="border-t pt-3 mt-3">
        <label className="block text-sm font-medium text-gray-600 mb-1">🔗 Веб-ссылки</label>
        {selectedNode!.links.map((link, i) => (
          <div key={i} className="flex items-center gap-1 mb-1">
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate flex-1 hover:underline">
              {link}
            </a>
            <button onClick={() => removeWebLink(selectedNode!.id, i)} className="text-red-400 text-xs">✕</button>
          </div>
        ))}
        <div className="flex gap-1">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWebLink()}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
            placeholder="https://..."
          />
          <button onClick={handleAddWebLink} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">+</button>
        </div>
      </div>

      {/* Obsidian Links */}
      <div className="border-t pt-3 mt-3">
        <label className="block text-sm font-medium text-gray-600 mb-1">📝 Obsidian заметки</label>
        {selectedNode!.obsidianLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-1 mb-1">
            <span className="text-xs text-purple-600 truncate flex-1">📄 {link.noteName}</span>
            <button onClick={() => removeObsidianLink(selectedNode!.id, i)} className="text-red-400 text-xs">✕</button>
          </div>
        ))}
        <div className="flex gap-1">
          <input
            type="text"
            value={newObsidianNote}
            onChange={(e) => setNewObsidianNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddObsidianLink()}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
            placeholder="Название заметки..."
          />
          <button onClick={handleAddObsidianLink} className="px-2 py-1 bg-purple-500 text-white rounded text-xs">+</button>
        </div>
      </div>

      {/* Checklist */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-600">☑️ Чеклист</label>
          <button onClick={() => addChecklistItem(selectedNode!.id)} className="text-xs text-blue-500 hover:text-blue-700">+ Добавить</button>
        </div>
        {selectedNode!.checklist.map(item => (
          <div key={item.id} className="flex items-center gap-1 mb-1">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => updateChecklistItem(selectedNode!.id, item.id, { checked: e.target.checked })}
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateChecklistItem(selectedNode!.id, item.id, { text: e.target.value })}
              className={`flex-1 border-none outline-none text-xs ${item.checked ? 'line-through text-gray-400' : ''}`}
              placeholder="Пункт чеклиста..."
            />
            <button onClick={() => deleteChecklistItem(selectedNode!.id, item.id)} className="text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="border-t pt-3 mt-3 space-y-2">
        <button
          onClick={handleAddChild}
          className="w-full py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          + Дочерний узел
        </button>
        <button
          onClick={() => setConnectingFrom(selectedNode!.id)}
          className={`w-full py-1.5 rounded text-sm ${connectingFrom === selectedNode!.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
        >
          🔗 {connectingFrom === selectedNode!.id ? 'Отмена связи' : 'Создать связь'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
