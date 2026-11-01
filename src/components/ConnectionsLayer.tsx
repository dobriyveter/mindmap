import React from 'react';
import { MindMapNode, NodeConnection } from '../types';
import useMindMapStore from '../store/mindmapStore';

interface Props {
  nodes: MindMapNode[];
  connections: NodeConnection[];
}

const ConnectionsLayer: React.FC<Props> = ({ nodes, connections }) => {
  const { selectConnection, selectedConnectionId } = useMindMapStore();

  console.log('🔗 ConnectionsLayer rendering:', {
    nodesCount: nodes.length,
    connectionsCount: connections.length,
    nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y, width: n.width, height: n.height })),
    connections: connections.map(c => ({ id: c.id, from: c.fromNodeId, to: c.toNodeId }))
  });

  if (connections.length === 0) {
    console.log('⚠️ No connections to render');
    return null;
  }

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '10000px',
        height: '10000px',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1,
      }}
    >
      {/* Тестовый элемент для проверки что SVG рендерится */}
      <rect x="100" y="100" width="200" height="100" fill="red" opacity="0.3" />
      <text x="150" y="150" fontSize="20" fill="black">SVG работает!</text>
      
      {connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.fromNodeId);
        const toNode = nodes.find(n => n.id === conn.toNodeId);
        
        if (!fromNode || !toNode) {
          console.warn('❌ Missing node for connection:', conn.id);
          return null;
        }

        // Центры узлов
        const fromX = fromNode.x + fromNode.width / 2;
        const fromY = fromNode.y + fromNode.height / 2;
        const toX = toNode.x + toNode.width / 2;
        const toY = toNode.y + toNode.height / 2;

        console.log('✅ Drawing connection:', {
          id: conn.id,
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY }
        });

        const isSelected = conn.id === selectedConnectionId;
        const color = isSelected ? '#3b82f6' : '#64748b';

        return (
          <g key={conn.id}>
            {/* Простая линия для теста */}
            <line
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={color}
              strokeWidth={isSelected ? 4 : 3}
              opacity={0.8}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                selectConnection(conn.id);
              }}
            />
            
            {/* Стрелка на конце */}
            <circle
              cx={toX}
              cy={toY}
              r={6}
              fill={color}
              opacity={0.8}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default ConnectionsLayer;
