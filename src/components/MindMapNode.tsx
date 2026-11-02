import React from 'react';
import { MindMapNode } from '../types';
import { useMindMapStore } from '../store/mindmapStore';
import { openInObsidian } from '../utils/obsidian';

interface Props {
  node: MindMapNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const MindMapNodeComponent: React.FC<Props> = ({ node, isSelected, onMouseDown }) => {
  const { selectedNodeIds, eisenhowerTasks, viewMode, obsidianVaultPath } = useMindMapStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isMultiSelected = selectedNodeIds.includes(node.id);
  const nodeTasks = eisenhowerTasks.filter(t => t.nodeId === node.id);
  const urgentTasks = nodeTasks.filter(t => (t.quadrant === 'A' || t.quadrant === 'C') && !t.done);
  
  const getPriorityColor = () => {
    if (urgentTasks.some(t => t.quadrant === 'A')) return '#dc2626';
    if (urgentTasks.some(t => t.quadrant === 'B')) return '#ea580c';
    if (urgentTasks.some(t => t.quadrant === 'C')) return '#2563eb';
    return null;
  };
  
  const priorityColor = getPriorityColor();

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode.mode === 'edit') {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText.trim()) {
      useMindMapStore.getState().updateNode(node.id, { text: editText });
    } else {
      setEditText(node.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditText(node.text);
      setIsEditing(false);
    }
    e.stopPropagation();
  };

  const getShapeClasses = () => {
    switch (node.shape) {
      case 'ellipse': return 'rounded-full';
      case 'rectangle': return 'rounded-none';
      default: return 'rounded-xl';
    }
  };

  const handleObsidianClick = (e: React.MouseEvent, noteName: string) => {
    e.stopPropagation();
    const vaultName = obsidianVaultPath.split(/[/\\]/).pop() || 'vault';
    openInObsidian(vaultName, noteName);
  };

  return (
    <div
      data-node-id={node.id}
      className={`absolute group select-none`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
        zIndex: node.zIndex,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`
          ${getShapeClasses()}
          border-2 transition-all duration-150
          ${isMultiSelected ? 'border-purple-500 shadow-lg shadow-purple-200/50 ring-2 ring-purple-300/50' : 
            isSelected ? 'border-blue-500 shadow-lg shadow-blue-200/50 ring-2 ring-blue-300/50' : 
            'border-gray-200 hover:border-gray-400 hover:shadow-md'}
          flex flex-col overflow-visible
        `}
        style={{
          backgroundColor: node.backgroundColor,
          color: node.color,
          fontSize: node.fontSize,
          fontWeight: node.fontWeight,
          width: '100%',
          minHeight: node.height,
        }}
      >
        <div className="flex items-start px-3 py-2 gap-1">
          {node.children.length > 0 && (
            <button
              onClick={(e) => { 
                e.stopPropagation();
                useMindMapStore.getState().updateNode(node.id, { collapsed: !node.collapsed });
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-xs flex-shrink-0 mt-0.5"
            >
              {node.collapsed ? '▶' : '▼'}
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/80 border border-blue-300 rounded px-2 py-1 resize-none text-inherit leading-snug"
                style={{ fontSize: 'inherit', fontWeight: 'inherit', color: '#1a1a2e', minHeight: '2em' }}
                rows={1}
              />
            ) : (
              <span className="break-words leading-snug">{node.text}</span>
            )}
          </div>
          
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
            {node.links.length > 0 && <span className="text-xs opacity-70">🔗</span>}
            {node.obsidianLinks.length > 0 && <span className="text-xs opacity-70">📝</span>}
            {node.imageUrl && <span className="text-xs opacity-70">🖼️</span>}
            
            {isSelected && viewMode.mode === 'edit' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const childX = node.x + node.width + 40;
                  const childY = node.y;
                  useMindMapStore.getState().addNode(childX, childY, node.id);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs hover:bg-green-600 shadow-sm"
                title="Добавить дочерний узел"
              >
                +
              </button>
            )}
          </div>
        </div>

        {priorityColor && viewMode.mode === 'edit' && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md animate-pulse"
            style={{ backgroundColor: priorityColor }}
            title={`Срочные задачи: ${urgentTasks.length}`}
          />
        )}

        {node.obsidianLinks.length > 0 && !node.collapsed && (
          <div className="px-3 pb-1 flex flex-wrap gap-1">
            {node.obsidianLinks.map((link, i) => (
              <button
                key={i}
                onClick={(e) => handleObsidianClick(e, link.noteName)}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] hover:bg-purple-200 border border-purple-200 max-w-full"
              >
                <span>📄</span>
                <span className="truncate">{link.noteName}</span>
              </button>
            ))}
          </div>
        )}

        {node.links.length > 0 && !node.collapsed && (
          <div className="px-3 pb-1 flex flex-wrap gap-1">
            {node.links.slice(0, 3).map((link, i) => {
              const displayUrl = link.replace(/^https?:\/\//, '').slice(0, 25);
              return (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] hover:bg-blue-100 border border-blue-200 max-w-full truncate"
                >
                  <span>🔗</span>
                  <span className="truncate">{displayUrl}</span>
                </a>
              );
            })}
          </div>
        )}

        {node.checklist.length > 0 && !node.collapsed && (
          <div className="px-3 pb-2">
            <div className="w-full bg-black/10 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(node.checklist.filter(i => i.checked).length / node.checklist.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapNodeComponent;
