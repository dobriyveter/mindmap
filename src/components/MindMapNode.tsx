import React, { useState, useRef, useEffect } from 'react';
import { MindMapNode as MindMapNodeType } from '../types';
import useMindMapStore from '../store/mindmapStore';

interface Props {
  node: MindMapNodeType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

const MindMapNodeComponent: React.FC<Props> = ({ node, isSelected, onMouseDown }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNode, toggleCollapse, viewMode } = useMindMapStore();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
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
  };

  const getShapeClasses = () => {
    switch (node.shape) {
      case 'ellipse': return 'rounded-full';
      case 'diamond': return 'rotate-45';
      case 'rectangle': return 'rounded-none';
      default: return 'rounded-xl';
    }
  };

  const completedChecklist = node.checklist.filter(i => i.checked).length;
  const totalChecklist = node.checklist.length;

  return (
    <div
      className={`absolute group select-none ${node.shape === 'diamond' ? 'flex items-center justify-center' : ''}`}
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
          ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-200 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400 hover:shadow-md'}
          ${viewMode.mode === 'presentation' ? 'bg-gray-800 text-white border-gray-600' : ''}
          flex flex-col overflow-hidden
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
        {/* Header with collapse button */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {node.children.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-xs flex-shrink-0"
              >
                {node.collapsed ? '▶' : '▼'}
              </button>
            )}
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none resize-none text-inherit"
                style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
                rows={2}
              />
            ) : (
              <span className="truncate">{node.text}</span>
            )}
          </div>
          
          {/* Indicators */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            {node.links.length > 0 && <span className="text-xs" title={`${node.links.length} ссылок`}>🔗</span>}
            {node.obsidianLinks.length > 0 && <span className="text-xs" title={`${node.obsidianLinks.length} заметок Obsidian`}>📝</span>}
            {node.imageUrl && <span className="text-xs" title="Есть изображение">🖼️</span>}
            {totalChecklist > 0 && (
              <span className="text-xs" title={`Чеклист: ${completedChecklist}/${totalChecklist}`}>
                ☑️{completedChecklist}/{totalChecklist}
              </span>
            )}
          </div>
        </div>

        {/* Image preview */}
        {node.imageUrl && (
          <div className="px-3 pb-2">
            <img src={node.imageUrl} alt="" className="w-full h-20 object-cover rounded" />
          </div>
        )}

        {/* Checklist preview */}
        {totalChecklist > 0 && !node.collapsed && (
          <div className="px-3 pb-2">
            <div className="w-full bg-black/10 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapNodeComponent;
