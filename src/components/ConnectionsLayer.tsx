import React from 'react';
import { MindMapNode, NodeConnection } from '../types';
import useMindMapStore from '../store/mindmapStore';

interface Props {
  nodes: MindMapNode[];
  connections: NodeConnection[];
}

const ConnectionsLayer: React.FC<Props> = ({ nodes, connections }) => {
  const { selectConnection, selectedConnectionId, connectingFrom } = useMindMapStore();

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
    };
  };

  const getStrokeDasharray = (style?: string) => {
    switch (style) {
      case 'dashed': return '8,4';
      case 'dotted': return '2,4';
      default: return '';
    }
  };

  // If connecting, show a line from source to mouse
  const renderConnectingLine = () => {
    if (!connectingFrom) return null;
    const from = getNodeCenter(connectingFrom);
    return (
      <line
        x1={from.x}
        y1={from.y}
        x2={from.x + 100}
        y2={from.y + 50}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.5"
      />
    );
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>

      {connections.map(conn => {
        const from = getNodeCenter(conn.fromNodeId);
        const to = getNodeCenter(conn.toNodeId);
        
        // Calculate control points for a smooth curve
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cx1 = from.x + dx * 0.3;
        const cy1 = from.y;
        const cx2 = to.x - dx * 0.3;
        const cy2 = to.y;

        const isSelected = conn.id === selectedConnectionId;

        return (
          <g key={conn.id} className="pointer-events-auto cursor-pointer"
            onClick={(e) => { e.stopPropagation(); selectConnection(conn.id); }}>
            {/* Invisible wider path for easier clicking */}
            <path
              d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
            />
            {/* Visible path */}
            <path
              d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
              fill="none"
              stroke={isSelected ? '#3b82f6' : (conn.color || '#64748b')}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray={getStrokeDasharray(conn.style)}
              markerEnd="url(#arrowhead)"
            />
            {/* Label */}
            {conn.label && (
              <text
                x={midX}
                y={midY - 8}
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
                className="pointer-events-none"
              >
                {conn.label}
              </text>
            )}
          </g>
        );
      })}

      {renderConnectingLine()}
    </svg>
  );
};

export default ConnectionsLayer;
