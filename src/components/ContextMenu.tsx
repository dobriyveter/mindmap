import React, { useEffect, useRef } from 'react';
import useMindMapStore from '../store/mindmapStore';

interface Props {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
}

const ContextMenu: React.FC<Props> = ({ x, y, nodeId, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    deleteNode, duplicateNode, addNode, addConnection,
    setConnectingFrom, nodes, updateNode, toggleCollapse,
  } = useMindMapStore();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const menuItems = [
    {
      label: '✏️ Редактировать',
      action: () => { onClose(); },
    },
    {
      label: '➕ Дочерний узел',
      action: () => {
        const childX = node.x + node.width + 50;
        const childY = node.y;
        // addNode с parentId автоматически создаёт визуальную связь
        addNode(childX, childY, nodeId);
        onClose();
      },
    },
    {
      label: '📋 Дублировать',
      action: () => { duplicateNode(nodeId); onClose(); },
    },
    {
      label: '🔗 Создать связь',
      action: () => { setConnectingFrom(nodeId); onClose(); },
    },
    {
      label: node.collapsed ? '▶️ Развернуть' : '◀️ Свернуть',
      action: () => { toggleCollapse(nodeId); onClose(); },
      hidden: node.children.length === 0,
    },
    { type: 'divider' as const },
    {
      label: '🎨 Синий',
      action: () => { updateNode(nodeId, { backgroundColor: '#dbeafe' }); onClose(); },
    },
    {
      label: '🟢 Зелёный',
      action: () => { updateNode(nodeId, { backgroundColor: '#d1fae5' }); onClose(); },
    },
    {
      label: '🟡 Жёлтый',
      action: () => { updateNode(nodeId, { backgroundColor: '#fef3c7' }); onClose(); },
    },
    {
      label: '🔴 Красный',
      action: () => { updateNode(nodeId, { backgroundColor: '#fee2e2' }); onClose(); },
    },
    {
      label: '🟣 Фиолетовый',
      action: () => { updateNode(nodeId, { backgroundColor: '#ede9fe' }); onClose(); },
    },
    { type: 'divider' as const },
    {
      label: '🗑️ Удалить',
      action: () => { deleteNode(nodeId); onClose(); },
      danger: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-[100] min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {menuItems.filter(item => !('hidden' in item && item.hidden)).map((item, i) => {
        if ('type' in item && item.type === 'divider') {
          return <div key={i} className="border-t border-gray-100 my-1" />;
        }
        const menuItem = item as { label: string; action: () => void; danger?: boolean };
        return (
          <button
            key={i}
            onClick={menuItem.action}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
              menuItem.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
            }`}
          >
            {menuItem.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
