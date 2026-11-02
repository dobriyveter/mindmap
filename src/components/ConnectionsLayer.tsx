import React, { useState } from 'react';
import { MindMapNode, NodeConnection } from '../types';
import { useMindMapStore } from '../store/mindmapStore';

interface Props {
  nodes: MindMapNode[];
  connections: NodeConnection[];
}

function generateTaperedArrow(
  fromX: number, fromY: number,
  toX: number, toY: number,
  startWidth: number, endWidth: number
): string {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 1) return '';
  
  const nx = dx / dist;
  const ny = dy / dist;
  const px = -ny;
  const py = nx;
  
  const cpDist = Math.min(dist * 0.35, 100);
  let cp1x: number, cp1y: number, cp2x: number, cp2y: number;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    cp1x = fromX + Math.sign(dx) * cpDist;
    cp1y = fromY;
    cp2x = toX - Math.sign(dx) * cpDist;
    cp2y = toY;
  } else {
    cp1x = fromX;
    cp1y = fromY + Math.sign(dy) * cpDist;
    cp2x = toX;
    cp2y = toY - Math.sign(dy) * cpDist;
  }
  
  const segments = 16;
  const leftPoints: Array<[number, number]> = [];
  const rightPoints: Array<[number, number]> = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    
    const bx = mt*mt*mt*fromX + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*toX;
    const by = mt*mt*mt*fromY + 3*mt*mt*t*cp1y + 3*mt*t*t*cp2y + t*t*t*toY;
    
    const tx = 3*mt*mt*(cp1x-fromX) + 6*mt*t*(cp2x-cp1x) + 3*t*t*(toX-cp2x);
    const ty = 3*mt*mt*(cp1y-fromY) + 6*mt*t*(cp2y-cp1y) + 3*t*t*(toY-cp2y);
    const tLen = Math.sqrt(tx*tx + ty*ty);
    if (tLen < 0.001) continue;
    
    const ppx = -ty / tLen;
    const ppy = tx / tLen;
    
    const eased = t * t * (3 - 2 * t);
    const w = startWidth + (endWidth - startWidth) * eased;
    const halfW = w / 2;
    
    leftPoints.push([bx + ppx * halfW, by + ppy * halfW]);
    rightPoints.push([bx - ppx * halfW, by - ppy * halfW]);
  }
  
  if (leftPoints.length < 2) return '';
  
  const arrowLen = Math.max(endWidth * 3, 8);
  const arrowHalfW = Math.max(endWidth * 1.5, 4);
  
  const tipBaseX = toX - nx * arrowLen;
  const tipBaseY = toY - ny * arrowLen;
  
  let path = `M ${leftPoints[0][0]},${leftPoints[0][1]}`;
  
  for (let i = 1; i < leftPoints.length; i++) {
    path += ` L ${leftPoints[i][0]},${leftPoints[i][1]}`;
  }
  
  path += ` L ${tipBaseX + px * arrowHalfW},${tipBaseY + py * arrowHalfW}`;
  path += ` L ${toX},${toY}`;
  path += ` L ${tipBaseX - px * arrowHalfW},${tipBaseY - py * arrowHalfW}`;
  
  for (let i = rightPoints.length - 1; i >= 0; i--) {
    path += ` L ${rightPoints[i][0]},${rightPoints[i][1]}`;
  }
  
  path += ' Z';
  return path;
}

const ConnectionsLayer: React.FC<Props> = ({ nodes, connections }) => {
  const { selectConnection, selectedConnectionId, connectingFrom } = useMindMapStore();

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  };

  const getNodeDepth = (nodeId: string): number => {
    let depth = 0;
    let current = nodes.find(n => n.id === nodeId);
    while (current?.parentId) {
      depth++;
      current = nodes.find(n => n.id === current!.parentId);
    }
    return depth;
  };

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
      {connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.fromNodeId);
        const toNode = nodes.find(n => n.id === conn.toNodeId);
        if (!fromNode || !toNode) return null;

        const fromCenter = getNodeCenter(conn.fromNodeId);
        const toCenter = getNodeCenter(conn.toNodeId);

        const depth = getNodeDepth(conn.fromNodeId);
        const startWidth = Math.max(10 - depth * 2, 4);
        const endWidth = Math.max(2 - depth * 0.3, 1);
        
        const isSelected = conn.id === selectedConnectionId;
        const sw = isSelected ? startWidth * 1.2 : startWidth;
        const ew = isSelected ? endWidth * 1.2 : endWidth;

        const path = generateTaperedArrow(
          fromCenter.x, fromCenter.y,
          toCenter.x, toCenter.y,
          sw, ew
        );
        
        const color = isSelected ? '#3b82f6' : (conn.color || '#64748b');
        const midX = (fromCenter.x + toCenter.x) / 2;
        const midY = (fromCenter.y + toCenter.y) / 2;

        return (
          <g key={conn.id}>
            <line
              x1={fromCenter.x} y1={fromCenter.y}
              x2={toCenter.x} y2={toCenter.y}
              stroke="transparent" strokeWidth="20"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); selectConnection(conn.id); }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Удалить эту связь?')) {
                  useMindMapStore.getState().deleteConnection(conn.id);
                }
              }}
            />
            
            {path && (
              <path
                d={path}
                fill={isSelected ? '#3b82f6' : color}
                opacity={isSelected ? 0.9 : 0.75}
                style={{ pointerEvents: 'none' }}
              />
            )}
            
            {conn.label && (
              <g>
                <rect
                  x={midX - conn.label.length * 3.5 - 6}
                  y={midY - 10}
                  width={conn.label.length * 7 + 12}
                  height={18}
                  rx="9"
                  fill="white"
                  stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#475569"
                  fontWeight="500"
                  style={{ pointerEvents: 'none' }}
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {connectingFrom && (() => {
        const center = getNodeCenter(connectingFrom);
        return (
          <circle cx={center.x} cy={center.y} r="10" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,3">
            <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
};

export default ConnectionsLayer;
