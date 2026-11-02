import React, { useState, useRef, useEffect } from 'react';
import { MindMapNode as MindMapNodeType } from '../types';
import useMindMapStore from '../store/mindmapStore';
import { openInObsidian } from '../utils/obsidian';

interface Props {
  node: MindMapNodeType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

const MindMapNodeComponent: React.FC<Props> = ({ node, isSelected: isSelectedProp, onMouseDown }) => {
  const { selectedNodeIds, updateNode, toggleCollapse, viewMode, obsidianVaultPath, nodes } = useMindMapStore();
  const isSelected = isSelectedProp || selectedNodeIds.includes(node.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode.mode === 'edit') {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText.trim()) {
      updateNode(node.id, { text: editText });
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

  const completedChecklist = node.checklist.filter(i => i.checked).length;
  const totalChecklist = node.checklist.length;

  // Получаем задачи Эйзенхауэра для этого узла
  const { eisenhowerTasks } = useMindMapStore();
  const nodeTasks = eisenhowerTasks.filter(t => t.nodeId === node.id);
  const urgentTasks = nodeTasks.filter(t => (t.quadrant === 'A' || t.quadrant === 'C') && !t.done);
  
  // Определяем цвет подсветки на основе приоритета задач
  const getPriorityColor = () => {
    if (urgentTasks.some(t => t.quadrant === 'A')) return '#dc2626'; // Красный - важно и срочно
    if (urgentTasks.some(t => t.quadrant === 'B')) return '#ea580c'; // Оранжевый - важно
    if (urgentTasks.some(t => t.quadrant === 'C')) return '#2563eb'; // Синий - срочно
    return null;
  };
  
  const priorityColor = getPriorityColor();

  const handleObsidianClick = (e: React.MouseEvent, noteName: string) => {
    e.stopPropagation();
    const vaultName = obsidianVaultPath.split(/[/\\]/).pop() || 'vault';
    openInObsidian(vaultName, noteName);
  };

  return (
    <div
      data-node-id={node.id}
      className={`absolute group select-none node-enter`}
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
          ${isSelected && selectedNodeIds.length > 1 ? 'border-purple-500 shadow-lg shadow-purple-200/50 ring-2 ring-purple-300/50' : 
            isSelected ? 'border-blue-500 shadow-lg shadow-blue-200/50 ring-2 ring-blue-300/50' : 
            'border-gray-200 hover:border-gray-400 hover:shadow-md'}
          ${viewMode.mode === 'presentation' ? 'border-gray-600' : ''}
          flex flex-col overflow-visible
        `}
        style={{
          backgroundColor: viewMode.mode === 'presentation' ? '#1f2937' : node.backgroundColor,
          color: viewMode.mode === 'presentation' ? '#ffffff' : node.color,
          fontSize: node.fontSize,
          fontWeight: node.fontWeight,
          width: '100%',
          minHeight: node.height,
        }}
      >
        {/* Header with collapse button and text */}
        <div className="flex items-start px-3 py-2 gap-1">
          {/* Collapse button */}
          {node.children.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-xs flex-shrink-0 mt-0.5"
            >
              {node.collapsed ? '▶' : '▼'}
            </button>
          )}
          
          {/* Text content - inline editing */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  // Auto-resize
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
          
          {/* Status indicators + add child button */}
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
            {node.links.length > 0 && (
              <span className="text-xs opacity-70" title={`${node.links.length} ссылок`}>🔗</span>
            )}
            {node.obsidianLinks.length > 0 && (
              <span className="text-xs opacity-70" title={`${node.obsidianLinks.length} заметок Obsidian`}>📝</span>
            )}
            {node.imageUrl && <span className="text-xs opacity-70" title="Изображение">🖼️</span>}
            {totalChecklist > 0 && (
              <span className="text-[10px] opacity-70" title={`Чеклист: ${completedChecklist}/${totalChecklist}`}>
                ☑️{completedChecklist}/{totalChecklist}
              </span>
            )}
      {/* Priority indicator - показывает срочность задач Эйзенхауэра */}
      {priorityColor && viewMode.mode === 'edit' && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md animate-pulse"
          style={{ backgroundColor: priorityColor }}
          title={`Срочные задачи: ${urgentTasks.length}`}
        />
      )}

      {/* Add child button - visible on hover when selected */}
      {isSelected && viewMode.mode === 'edit' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const childX = node.x + node.width + 40;
            const childY = node.y;
            useMindMapStore.getState().addNode(childX, childY, node.id);
          }}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs hover:bg-green-600 shadow-sm transition-all hover:scale-110"
          title="Добавить дочерний узел"
        >
          +
        </button>
      )}          </div>
        </div>

        {/* Image preview */}
        {node.imageUrl && (
          <div className="px-3 pb-1">
            <img src={node.imageUrl} alt="" className="w-full h-16 object-cover rounded border border-gray-200" />
          </div>
        )}

        {/* Obsidian links - shown inline in the node */}
        {node.obsidianLinks.length > 0 && !node.collapsed && (
          <div className="px-3 pb-1 flex flex-wrap gap-1">
            {node.obsidianLinks.map((link, i) => (
              <button
                key={i}
                onClick={(e) => handleObsidianClick(e, link.noteName)}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] hover:bg-purple-200 transition-colors border border-purple-200 max-w-full"
                title={`Открыть "${link.noteName}" в Obsidian`}
              >
                <span>📄</span>
                <span className="truncate">{link.noteName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Web links - shown inline in the node */}
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
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] hover:bg-blue-100 transition-colors border border-blue-200 max-w-full truncate"
                  title={link}
                >
                  <span>🔗</span>
                  <span className="truncate">{displayUrl}{link.length > 25 ? '...' : ''}</span>
                </a>
              );
            })}
            {node.links.length > 3 && (
              <span className="text-[10px] text-gray-400 self-center">+{node.links.length - 3}</span>
            )}
          </div>
        )}

        {/* Checklist progress bar */}
        {totalChecklist > 0 && !node.collapsed && (
          <div className="px-3 pb-2">
            <div className="w-full bg-black/10 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
              />
            </div>
            <span className="text-[9px] opacity-60 mt-0.5 block">
              {completedChecklist} из {totalChecklist}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapNodeComponent;
