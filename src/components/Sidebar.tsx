import React, { useState } from 'react';
import useMindMapStore from '../store/mindmapStore';
import { searchObsidianNotes, openInObsidian } from '../utils/obsidian';

const COLORS = [
  '#e8f4f8', '#fef3c7', '#fce7f3', '#e0f2fe', '#d1fae5',
  '#ede9fe', '#fee2e2', '#f0fdf4', '#fff7ed', '#f5f3ff',
  '#ffffff', '#fef2f2', '#ecfdf5', '#eff6ff', '#faf5ff',
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
    setConnectingFrom, connectingFrom, duplicateNode,
  } = useMindMapStore();

  const [newLink, setNewLink] = useState('');
  const [newObsidianNote, setNewObsidianNote] = useState('');
  const [obsidianSearchResults, setObsidianSearchResults] = useState<Array<{path: string; name: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  const handleAddChild = () => {
    if (!selectedNode) return;
    const childX = selectedNode.x + selectedNode.width + 50;
    const childY = selectedNode.y;
    const childId = addNode(childX, childY, selectedNode.id);
    useMindMapStore.getState().addConnection(selectedNode.id, childId);
  };

  const handleAddWebLink = () => {
    if (!selectedNodeId || !newLink.trim()) return;
    let url = newLink.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    addWebLink(selectedNodeId, url);
    setNewLink('');
  };

  const handleSearchObsidian = async () => {
    if (!newObsidianNote.trim()) return;
    setIsSearching(true);
    const results = await searchObsidianNotes(newObsidianNote.trim());
    setObsidianSearchResults(results);
    setIsSearching(false);
  };

  const handleAddObsidianLink = () => {
    if (!selectedNodeId || !newObsidianNote.trim()) return;
    addObsidianLink(selectedNodeId, { vaultPath: obsidianVaultPath, noteName: newObsidianNote.trim() });
    setNewObsidianNote('');
    setObsidianSearchResults([]);
  };

  const handleOpenObsidian = (noteName: string) => {
    const vaultName = obsidianVaultPath.split(/[/\\]/).pop() || 'vault';
    openInObsidian(vaultName, noteName);
  };

  if (!selectedNode && !selectedConnection) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-3">Свойства</h3>
        <p className="text-sm text-gray-500 mb-4">
          Выберите узел или связь для редактирования.
        </p>
        <div className="p-3 bg-blue-50 rounded-lg mb-3">
          <p className="text-xs text-blue-700 font-medium mb-2">💡 Управление:</p>
          <ul className="text-xs text-blue-600 space-y-1.5">
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">Двойной клик</kbd> на пустом месте — новый узел</li>
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">Двойной клик</kbd> на узле — редактировать текст</li>
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">ПКМ</kbd> на узле — контекстное меню</li>
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">Delete</kbd> — удалить узел</li>
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">Ctrl+Z/Y</kbd> — отмена/повтор</li>
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">Ctrl+D</kbd> — дублировать</li>
            <li>• <kbd className="bg-white px-1 rounded border text-[10px]">Колёсико</kbd> — масштаб</li>
            <li>• Перетаскивание пустого места — перемещение</li>
          </ul>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-700 font-medium mb-2">📊 Карта:</p>
          <div className="flex justify-between text-xs text-purple-600">
            <span>Узлов:</span><span className="font-medium">{nodes.length}</span>
          </div>
          <div className="flex justify-between text-xs text-purple-600">
            <span>Связей:</span><span className="font-medium">{connections.length}</span>
          </div>
        </div>
      </div>
    );
  }

  if (selectedConnection) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">🔗 Связь</h3>
          <button
            onClick={() => useMindMapStore.getState().deleteConnection(selectedConnection.id)}
            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
          >
            🗑️ Удалить
          </button>
        </div>
        
        <label className="block text-sm font-medium text-gray-600 mb-1">Метка</label>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
          placeholder="Название связи..."
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">Стиль</label>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
        >
          <option value="solid">Сплошная</option>
          <option value="dashed">Пунктирная</option>
          <option value="dotted">Точечная</option>
        </select>

        <label className="block text-sm font-medium text-gray-600 mb-1">Цвет</label>
        <input
          type="color"
          value={selectedConnection.color || '#64748b'}
          onChange={(e) => {
            const conns = useMindMapStore.getState().connections;
            const idx = conns.findIndex(c => c.id === selectedConnection.id);
            if (idx !== -1) {
              const updated = [...conns];
              updated[idx] = { ...updated[idx], color: e.target.value };
              useMindMapStore.setState({ connections: updated, isDirty: true });
            }
          }}
          className="w-full h-8 rounded border border-gray-300"
        />
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <h3 className="font-semibold text-gray-700 text-sm">✏️ Свойства узла</h3>
        <div className="flex gap-1">
          <button onClick={() => duplicateNode(selectedNode!.id)} className="text-gray-400 hover:text-blue-500 text-sm p-1" title="Дублировать">
            📋
          </button>
          <button onClick={() => deleteNode(selectedNode!.id)} className="text-gray-400 hover:text-red-500 text-sm p-1" title="Удалить">
            🗑️
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Text - shown for reference, editing is in the node itself */}
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Текст (двойной клик на узле для редактирования)</p>
          <p className="text-sm text-gray-700 font-medium">{selectedNode!.text}</p>
        </div>

        {/* Background color */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Цвет фона</label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => updateNode(selectedNode!.id, { backgroundColor: color })}
                className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${
                  selectedNode!.backgroundColor === color ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Text color */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Цвет текста</label>
            <input
              type="color"
              value={selectedNode!.color}
              onChange={(e) => updateNode(selectedNode!.id, { color: e.target.value })}
              className="w-full h-7 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Размер: {selectedNode!.fontSize}px</label>
            <input
              type="range"
              min="10"
              max="28"
              value={selectedNode!.fontSize}
              onChange={(e) => updateNode(selectedNode!.id, { fontSize: parseInt(e.target.value) })}
              className="w-full mt-1"
            />
          </div>
        </div>

        {/* Font weight & Shape */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Жирность</label>
            <select
              value={selectedNode!.fontWeight}
              onChange={(e) => updateNode(selectedNode!.id, { fontWeight: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            >
              <option value="normal">Обычный</option>
              <option value="bold">Жирный</option>
              <option value="light">Тонкий</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Форма</label>
            <div className="flex gap-0.5">
              {SHAPES.map(shape => (
                <button
                  key={shape.value}
                  onClick={() => updateNode(selectedNode!.id, { shape: shape.value })}
                  className={`flex-1 py-1 text-center rounded border text-xs ${
                    selectedNode!.shape === shape.value ? 'bg-blue-100 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  title={shape.label}
                >
                  {shape.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">🖼️ URL изображения</label>
          <input
            type="text"
            value={selectedNode!.imageUrl || ''}
            onChange={(e) => updateNode(selectedNode!.id, { imageUrl: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
            placeholder="https://..."
          />
        </div>

        {/* Web Links */}
        <div className="border-t pt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">🔗 Веб-ссылки</label>
          {selectedNode!.links.map((link, i) => (
            <div key={i} className="flex items-center gap-1 mb-1 group">
              <a href={link} target="_blank" rel="noopener noreferrer" 
                className="text-xs text-blue-600 truncate flex-1 hover:underline" title={link}>
                {link.replace(/^https?:\/\//, '').slice(0, 30)}
              </a>
              <button onClick={() => removeWebLink(selectedNode!.id, i)} 
                className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWebLink()}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="https://example.com"
            />
            <button onClick={handleAddWebLink} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600">+</button>
          </div>
        </div>

        {/* Obsidian Links */}
        <div className="border-t pt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">📝 Заметки Obsidian</label>
          {selectedNode!.obsidianLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-1 mb-1 group">
              <button
                onClick={() => handleOpenObsidian(link.noteName)}
                className="text-xs text-purple-600 truncate flex-1 hover:underline text-left"
                title={`Открыть "${link.noteName}" в Obsidian`}
              >
                📄 {link.noteName}
              </button>
              <button onClick={() => removeObsidianLink(selectedNode!.id, i)}
                className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              value={newObsidianNote}
              onChange={(e) => setNewObsidianNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddObsidianLink();
              }}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="Название заметки..."
            />
            <button onClick={handleAddObsidianLink} className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600">+</button>
          </div>
          {/* Search in Obsidian */}
          {newObsidianNote.trim() && (
            <button
              onClick={handleSearchObsidian}
              className="mt-1 text-xs text-purple-600 hover:text-purple-800"
              disabled={isSearching}
            >
              {isSearching ? '⏳ Поиск...' : '🔍 Искать в Obsidian'}
            </button>
          )}
          {obsidianSearchResults.length > 0 && (
            <div className="mt-1 max-h-24 overflow-y-auto border rounded-lg">
              {obsidianSearchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNewObsidianNote(result.name);
                    setObsidianSearchResults([]);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-purple-50 border-b last:border-b-0"
                >
                  📄 {result.name}
                </button>
              ))}
            </div>
          )}
          {!obsidianVaultPath && (
            <p className="text-[10px] text-gray-400 mt-1">
              💡 Настройте путь к Obsidian в ⚙️ Настройках
            </p>
          )}
        </div>

        {/* Checklist */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-500">☑️ Чеклист</label>
            <button onClick={() => addChecklistItem(selectedNode!.id)} className="text-xs text-blue-500 hover:text-blue-700">+ Добавить</button>
          </div>
          {selectedNode!.checklist.map(item => (
            <div key={item.id} className="flex items-center gap-1.5 mb-1 group">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => updateChecklistItem(selectedNode!.id, item.id, { checked: e.target.checked })}
                className="flex-shrink-0"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateChecklistItem(selectedNode!.id, item.id, { text: e.target.value })}
                className={`flex-1 border-none outline-none text-xs bg-transparent ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                placeholder="Пункт..."
              />
              <button onClick={() => deleteChecklistItem(selectedNode!.id, item.id)}
                className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="border-t pt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">📝 Заметки</label>
          <textarea
            value={selectedNode!.notes || ''}
            onChange={(e) => updateNode(selectedNode!.id, { notes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
            rows={3}
            placeholder="Дополнительные заметки..."
          />
        </div>

        {/* Actions */}
        <div className="border-t pt-3 space-y-2">
          <button
            onClick={handleAddChild}
            className="w-full py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
          >
            ➕ Дочерний узел
          </button>
          <button
            onClick={() => setConnectingFrom(selectedNode!.id)}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
              connectingFrom === selectedNode!.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            🔗 {connectingFrom === selectedNode!.id ? '✕ Отмена связи' : 'Создать связь'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
