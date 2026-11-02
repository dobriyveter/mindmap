import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useMindMapStore } from '../store/mindmapStore';
import MindMapNodeComponent from './MindMapNode';
import ConnectionsLayer from './ConnectionsLayer';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    nodes, connections, selectedNodeId, selectedConnectionId, zoom, panX, panY,
    setZoom, setPan, addNode, selectNode, viewMode, connectingFrom,
    setConnectingFrom,
  } = useMindMapStore();

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragNode, setDragNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

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
        selectNode(null);
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
      setDragNode(null);
    }
  }, [dragNode]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-id]')) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top - panY) / zoom;
      addNode(x, y);
    }
  }, [panX, panY, zoom, addNode]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        useMindMapStore.getState().addConnection(connectingFrom, nodeId);
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
  }, [nodes, connectingFrom, selectNode, setConnectingFrom, panX, panY, zoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'Delete') {
        if (selectedNodeId) {
          useMindMapStore.getState().deleteNode(selectedNodeId);
        } else if (selectedConnectionId) {
          useMindMapStore.getState().deleteConnection(selectedConnectionId);
        }
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
      }
      if (e.ctrlKey && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) {
          useMindMapStore.getState().addNode(node.x + 30, node.y + 30);
        }
      }
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) {
          useMindMapStore.getState().addNode(node.x + node.width + 40, node.y, selectedNodeId);
        }
      }
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) {
          useMindMapStore.getState().addNode(node.x, node.y + node.height + 20, node.parentId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedConnectionId, nodes]);

  return (
    <div
      ref={canvasRef}
      className={`canvas-bg w-full h-full relative overflow-hidden bg-gray-50`}
      style={{ cursor: isPanning ? 'grabbing' : connectingFrom ? 'crosshair' : 'default' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
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
        <ConnectionsLayer nodes={nodes} connections={connections} />
        {nodes.map(node => (
          <MindMapNodeComponent
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          />
        ))}
      </div>

      <div className="absolute bottom-4 right-4 bg-white/80 rounded-lg px-3 py-1 text-sm shadow">
        {Math.round(zoom * 100)}%
      </div>

      {nodes.length === 0 && viewMode.mode === 'edit' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="bg-white/90 rounded-xl shadow-lg p-6 max-w-md">
            <div className="text-4xl mb-3">🧠</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Добро пожаловать в MindFlow!</h2>
            <p className="text-sm text-gray-600 mb-4">Начните создавать ментальную карту</p>
            <div className="space-y-2 text-left text-sm text-gray-700">
              <p>💡 <strong>Двойной клик</strong> на пустом месте — создать узел</p>
              <p>💡 Или нажмите кнопку <strong>➕</strong> в тулбаре</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
