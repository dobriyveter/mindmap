import React, { useState } from 'react';
import { useMindMapStore } from '../store/mindmapStore';

const COLORS = ['#e8f4f8', '#fef3c7', '#fce7f3', '#e0f2fe', '#d1fae5', '#ede9fe', '#fee2e2'];
const SHAPES: Array<{ value: 'rectangle' | 'rounded' | 'ellipse' | 'diamond'; icon: string }> = [
  { value: 'rounded', icon: '⬜' },
  { value: 'rectangle', icon: '▬' },
  { value: 'ellipse', icon: '⬭' },
  { value: 'diamond', icon: '◆' },
];

const Sidebar: React.FC = () => {
  const { nodes, connections, selectedNodeId, selectedConnectionId } = useMindMapStore();
  const [newLink, setNewLink] = useState('');
  const [newObsidianNote, setNewObsidianNote] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  if (!selectedNode && !selectedConnection) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-3">Свойства</h3>
        <p className="text-sm text-gray-500">Выберите узел или связь для редактирования.</p>
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
          <h3 className="font-semibold text-gray-700">🔗 Связь</h3>
          <button
            onClick={() => useMindMapStore.getState().deleteConnection(selectedConnection.id)}
            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
          >🗑️ Удалить</button>
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
        />
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <h3 className="font-semibold text-gray-700 text-sm">✏️ Свойства узла</h3>
        <button onClick={() => useMindMapStore.getState().deleteNode(selectedNode!.id)} className="text-gray-400 hover:text-red-500 text-sm p-1">🗑️</button>
      </div>

      <div className="p-4 space-y-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Текст (двойной клик на узле для редактирования)</p>
          <p className="text-sm text-gray-700 font-medium">{selectedNode!.text}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Цвет фона</label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => useMindMapStore.getState().updateNode(selectedNode!.id, { backgroundColor: color })}
                className={`w-6 h-6 rounded-md border ${selectedNode!.backgroundColor === color ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Цвет текста</label>
            <input
              type="color"
              value={selectedNode!.color}
              onChange={(e) => useMindMapStore.getState().updateNode(selectedNode!.id, { color: e.target.value })}
              className="w-full h-7 rounded border border-gray-300"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Размер: {selectedNode!.fontSize}px</label>
            <input
              type="range"
              min="10"
              max="28"
              value={selectedNode!.fontSize}
              onChange={(e) => useMindMapStore.getState().updateNode(selectedNode!.id, { fontSize: parseInt(e.target.value) })}
              className="w-full mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Форма</label>
          <div className="flex gap-0.5">
            {SHAPES.map(shape => (
              <button
                key={shape.value}
                onClick={() => useMindMapStore.getState().updateNode(selectedNode!.id, { shape: shape.value })}
                className={`flex-1 py-1 text-center rounded border text-xs ${selectedNode!.shape === shape.value ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
              >{shape.icon}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">🔗 Веб-ссылки</label>
          {selectedNode!.links.map((link, i) => (
            <div key={i} className="flex items-center gap-1 mb-1 group">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate flex-1 hover:underline">
                {link.replace(/^https?:\/\//, '').slice(0, 30)}
              </a>
              <button onClick={() => {
                const links = [...selectedNode!.links];
                links.splice(i, 1);
                useMindMapStore.getState().updateNode(selectedNode!.id, { links });
              }} className="text-red-400 text-xs">✕</button>
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newLink.trim()) {
                  useMindMapStore.getState().updateNode(selectedNode!.id, { links: [...selectedNode!.links, newLink.trim()] });
                  setNewLink('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="https://..."
            />
            <button onClick={() => {
              if (newLink.trim()) {
                useMindMapStore.getState().updateNode(selectedNode!.id, { links: [...selectedNode!.links, newLink.trim()] });
                setNewLink('');
              }
            }} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs">+</button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">📝 Заметки Obsidian</label>
          {selectedNode!.obsidianLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-1 mb-1 group">
              <span className="text-xs text-purple-600 truncate flex-1">📄 {link.noteName}</span>
              <button onClick={() => {
                const links = [...selectedNode!.obsidianLinks];
                links.splice(i, 1);
                useMindMapStore.getState().updateNode(selectedNode!.id, { obsidianLinks: links });
              }} className="text-red-400 text-xs">✕</button>
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              value={newObsidianNote}
              onChange={(e) => setNewObsidianNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newObsidianNote.trim()) {
                  const vaultPath = useMindMapStore.getState().obsidianVaultPath;
                  useMindMapStore.getState().updateNode(selectedNode!.id, {
                    obsidianLinks: [...selectedNode!.obsidianLinks, { vaultPath, noteName: newObsidianNote.trim() }]
                  });
                  setNewObsidianNote('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="Название заметки..."
            />
            <button onClick={() => {
              if (newObsidianNote.trim()) {
                const vaultPath = useMindMapStore.getState().obsidianVaultPath;
                useMindMapStore.getState().updateNode(selectedNode!.id, {
                  obsidianLinks: [...selectedNode!.obsidianLinks, { vaultPath, noteName: newObsidianNote.trim() }]
                });
                setNewObsidianNote('');
              }
            }} className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs">+</button>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <button
            onClick={() => {
              const childX = selectedNode!.x + selectedNode!.width + 50;
              const childY = selectedNode!.y;
              useMindMapStore.getState().addNode(childX, childY, selectedNode!.id);
            }}
            className="w-full py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600"
          >➕ Дочерний узел</button>
          <button
            onClick={() => useMindMapStore.getState().setConnectingFrom(selectedNode!.id)}
            className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200"
          >🔗 Создать связь</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
