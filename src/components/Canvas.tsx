import React, { useRef, useCallback, useEffect, useState } from 'react';
import useMindMapStore from '../store/mindmapStore';
import MindMapNodeComponent from './MindMapNode';
import ConnectionsLayer from './ConnectionsLayer';
import ContextMenu from './ContextMenu';
import MiniMap from './MiniMap';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    nodes, connections, selectedNodeId, zoom, panX, panY,
    setZoom, setPan, addNode, selectNode, viewMode, connectingFrom,
    setConnectingFrom, addConnection,
  } = useMindMapStore();

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragNode, setDragNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(zoom + delta);
  }, [zoom, setZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      if (connectingFrom) {
        setConnectingFrom(null);
        return;
      }
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
        selectNode(null); // очищает и selectedNodeIds
      }
    }
  }, [panX, panY, selectNode, connectingFrom, setConnectingFrom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan(e.clientX - panStart.x, e.clientY - panStart.y);
    }
    if (dragNode) {
      const node = nodes.find(n => n.id === dragNode.id);
      if (node) {
        const newX = (e.clientX - panX - dragNode.offsetX) / zoom;
        const newY = (e.clientY - panY - dragNode.offsetY) / zoom;
        useMindMapStore.getState().updateNode(dragNode.id, { x: newX, y: newY });
      }
    }
  }, [isPanning, panStart, panX, panY, dragNode, nodes, zoom, setPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (dragNode) {
      useMindMapStore.getState().saveToHistory();
      setDragNode(null);
    }
  }, [dragNode]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - panX) / zoom;
        const y = (e.clientY - rect.top - panY) / zoom;
        addNode(x, y);
      }
    }
  }, [panX, panY, zoom, addNode]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Right click - context menu
    if (e.button === 2) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
      return;
    }

    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        addConnection(connectingFrom, nodeId);
      }
      setConnectingFrom(null);
      return;
    }

    selectNode(nodeId, e.ctrlKey || e.metaKey);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const offsetX = e.clientX - rect.left - panX - node.x * zoom;
      const offsetY = e.clientY - rect.top - panY - node.y * zoom;
      setDragNode({ id: nodeId, offsetX, offsetY });
    }
  }, [nodes, connectingFrom, selectNode, addConnection, setConnectingFrom, panX, panY, zoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when editing text
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'Delete' && selectedNodeId) {
        useMindMapStore.getState().deleteNode(selectedNodeId);
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        useMindMapStore.getState().undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        useMindMapStore.getState().redo();
      }
      if (e.ctrlKey && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        useMindMapStore.getState().duplicateNode(selectedNodeId);
      }
      // Tab — create child node
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) {
          const childX = node.x + node.width + 40;
          const childY = node.y;
          useMindMapStore.getState().addNode(childX, childY, selectedNodeId);
        }
      }
      // Enter — create sibling node (same parent)
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) {
          const siblingX = node.x;
          const siblingY = node.y + node.height + 20;
          useMindMapStore.getState().addNode(siblingX, siblingY, node.parentId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, nodes]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (useMindMapStore.getState().isDirty) {
        useMindMapStore.getState().saveToLocal();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load on mount
  useEffect(() => {
    useMindMapStore.getState().loadFromLocal();
  }, []);

  const getVisibleNodes = () => {
    if (viewMode.mode === 'focus' && viewMode.focusNodeId) {
      // Show only the focused node and its ancestors/descendants
      const visibleIds = new Set<string>();
      const collectVisible = (nodeId: string) => {
        visibleIds.add(nodeId);
        const node = nodes.find(n => n.id === nodeId);
        if (node && !node.collapsed) {
          node.children.forEach(childId => collectVisible(childId));
        }
      };
      // Find root ancestors
      let currentId: string | undefined = viewMode.focusNodeId;
      const ancestors: string[] = [];
      while (currentId) {
        ancestors.unshift(currentId);
        const node = nodes.find(n => n.id === currentId);
        currentId = node?.parentId;
      }
      ancestors.forEach(id => collectVisible(id));
      return nodes.filter(n => visibleIds.has(n.id));
    }
    return nodes;
  };

  const visibleNodes = getVisibleNodes();

  console.log('🎨 Canvas rendering:', {
    nodesCount: visibleNodes.length,
    connectionsCount: connections.length,
    panX, panY, zoom,
    nodes: visibleNodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
  });

  return (
    <div
      ref={canvasRef}
      className={`canvas-bg w-full h-full relative overflow-hidden ${
        viewMode.mode === 'presentation' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{ cursor: isPanning ? 'grabbing' : connectingFrom ? 'crosshair' : 'default' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Grid pattern */}
      {viewMode.mode === 'edit' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern id="grid" width={40 * zoom} height={40 * zoom} patternUnits="userSpaceOnUse"
              x={panX % (40 * zoom)} y={panY % (40 * zoom)}>
              <path d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Transform container */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 10000,
          height: 10000,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Connections */}
        <ConnectionsLayer nodes={visibleNodes} connections={connections} />

        {/* Nodes */}
        {visibleNodes.map(node => (
          <MindMapNodeComponent
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 rounded-lg px-3 py-1 text-sm shadow">
        {Math.round(zoom * 100)}%
      </div>

      {/* Mini Map */}
      <MiniMap />

      {/* Multi-select hint */}
      {selectedNodeId && viewMode.mode === 'edit' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/70 text-white px-3 py-1.5 rounded-lg text-xs pointer-events-none">
          💡 <kbd className="bg-white/20 px-1 rounded">Ctrl+клик</kbd> по узлам — выделить несколько для связи
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Canvas;
