import React from 'react';
import { MindMapNode, NodeConnection } from '../types';
import useMindMapStore from '../store/mindmapStore';

interface Props {
  nodes: MindMapNode[];
  connections: NodeConnection[];
}

/**
 * Get the point on a cubic bezier curve at parameter t
 */
function bezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

/**
 * Get the tangent (derivative) of a cubic bezier at parameter t
 */
function bezierTangent(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

/**
 * Generate a tapered path (filled shape) from parent to child.
 * The shape is thick at the parent side and thin at the child side.
 */
function generateTaperedPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  startWidth: number,
  endWidth: number,
  segments: number = 20
): string {
  // Control points for smooth bezier
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Adaptive control points based on direction
  const cpOffset = Math.min(dist * 0.4, 150);
  
  const p0 = from;
  const p1 = { x: from.x + cpOffset, y: from.y };
  const p2 = { x: to.x - cpOffset, y: to.y };
  const p3 = to;

  // Build left and right edge points
  const leftPoints: { x: number; y: number }[] = [];
  const rightPoints: { x: number; y: number }[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = bezierPoint(p0, p1, p2, p3, t);
    const tangent = bezierTangent(p0, p1, p2, p3, t);
    
    // Normalize tangent
    const len = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
    if (len === 0) continue;
    const nx = -tangent.y / len; // perpendicular
    const ny = tangent.x / len;
    
    // Interpolate width with easing (smooth taper)
    const easedT = t * t * (3 - 2 * t); // smoothstep
    const currentWidth = startWidth + (endWidth - startWidth) * easedT;
    const halfWidth = currentWidth / 2;
    
    leftPoints.push({ x: point.x + nx * halfWidth, y: point.y + ny * halfWidth });
    rightPoints.push({ x: point.x - nx * halfWidth, y: point.y - ny * halfWidth });
  }

  // Build SVG path: go along left edge, then reverse along right edge
  if (leftPoints.length < 2) return '';
  
  let d = `M ${leftPoints[0].x} ${leftPoints[0].y}`;
  for (let i = 1; i < leftPoints.length; i++) {
    d += ` L ${leftPoints[i].x} ${leftPoints[i].y}`;
  }
  // Arrow tip at the end
  const tipX = to.x;
  const tipY = to.y;
  d += ` L ${tipX} ${tipY}`;
  // Go back along right edge
  for (let i = rightPoints.length - 1; i >= 0; i--) {
    d += ` L ${rightPoints[i].x} ${rightPoints[i].y}`;
  }
  d += ' Z';
  
  return d;
}

/**
 * Get the edge point of a node where a connection should start/end
 */
function getEdgePoint(
  node: MindMapNode,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  
  const dx = targetX - cx;
  const dy = targetY - cy;
  
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  
  const angle = Math.atan2(dy, dx);
  const hw = node.width / 2;
  const hh = node.height / 2;
  
  // Find intersection with rectangle edge
  let ex: number, ey: number;
  
  if (node.shape === 'ellipse') {
    // Ellipse intersection
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const r = (hw * hh) / Math.sqrt(hh * hh * cos * cos + hw * hw * sin * sin);
    ex = cx + r * cos;
    ey = cy + r * sin;
  } else {
    // Rectangle intersection
    const tanAngle = Math.abs(dy / (dx || 0.001));
    if (tanAngle <= hh / hw) {
      // Hits left or right edge
      ex = cx + Math.sign(dx) * hw;
      ey = cy + Math.sign(dx) * hw * (dy / (dx || 0.001));
    } else {
      // Hits top or bottom edge
      ey = cy + Math.sign(dy) * hh;
      ex = cx + Math.sign(dy) * hh * (dx / (dy || 0.001));
    }
  }
  
  return { x: ex, y: ey };
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

  // Calculate connection "depth" for width scaling
  // Root connections are thicker, deeper ones are thinner
  const getConnectionDepth = (conn: NodeConnection): number => {
    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    if (!fromNode) return 0;
    
    // Count how many ancestors the fromNode has
    let depth = 0;
    let current = fromNode;
    while (current.parentId) {
      depth++;
      const parent = nodes.find(n => n.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return depth;
  };

  // Calculate SVG bounds to cover all nodes
  let svgMinX = -500, svgMinY = -500, svgMaxX = 3000, svgMaxY = 3000;
  if (nodes.length > 0) {
    svgMinX = Math.min(...nodes.map(n => n.x)) - 500;
    svgMinY = Math.min(...nodes.map(n => n.y)) - 500;
    svgMaxX = Math.max(...nodes.map(n => n.x + n.width)) + 500;
    svgMaxY = Math.max(...nodes.map(n => n.y + n.height)) + 500;
  }
  const svgWidth = svgMaxX - svgMinX;
  const svgHeight = svgMaxY - svgMinY;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: svgMinX,
        top: svgMinY,
        width: svgWidth,
        height: svgHeight,
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Gradient definitions for each connection */}
        {connections.map(conn => {
          const from = getNodeCenter(conn.fromNodeId);
          const to = getNodeCenter(conn.toNodeId);
          const id = `grad-${conn.id}`;
          const color = conn.color || '#64748b';
          return (
            <linearGradient key={id} id={id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </linearGradient>
          );
        })}
      </defs>

      {connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.fromNodeId);
        const toNode = nodes.find(n => n.id === conn.toNodeId);
        if (!fromNode || !toNode) return null;

        const fromCenter = getNodeCenter(conn.fromNodeId);
        const toCenter = getNodeCenter(conn.toNodeId);
        
        // Get edge points
        const from = getEdgePoint(fromNode, toCenter.x, toCenter.y);
        const to = getEdgePoint(toNode, fromCenter.x, fromCenter.y);

        // Width based on depth (thicker for root connections)
        const depth = getConnectionDepth(conn);
        const baseStartWidth = Math.max(6 - depth * 1.2, 2);
        const baseEndWidth = Math.max(1.5 - depth * 0.3, 0.5);
        
        const isSelected = conn.id === selectedConnectionId;
        const startWidth = isSelected ? baseStartWidth * 1.5 : baseStartWidth;
        const endWidth = isSelected ? baseEndWidth * 1.5 : baseEndWidth;

        // Generate tapered path
        const pathD = generateTaperedPath(from, to, startWidth, endWidth);
        
        // Arrow head at the end
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);
        const arrowSize = Math.max(endWidth * 3, 6);
        const arrowP1 = {
          x: to.x - arrowSize * Math.cos(angle - 0.4),
          y: to.y - arrowSize * Math.sin(angle - 0.4),
        };
        const arrowP2 = {
          x: to.x - arrowSize * Math.cos(angle + 0.4),
          y: to.y - arrowSize * Math.sin(angle + 0.4),
        };

        // Label position (midpoint of curve)
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 10;

        return (
          <g key={conn.id} className="pointer-events-auto cursor-pointer"
            onClick={(e) => { e.stopPropagation(); selectConnection(conn.id); }}>
            {/* Invisible wider path for easier clicking */}
            <path
              d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2}, ${to.x} ${to.y}`}
              fill="none"
              stroke="transparent"
              strokeWidth="14"
            />
            {/* Tapered connection shape */}
            {pathD && (
              <path
                d={pathD}
                fill={`url(#grad-${conn.id})`}
                stroke={isSelected ? '#3b82f6' : 'none'}
                strokeWidth={isSelected ? 1 : 0}
                opacity={0.85}
              />
            )}
            {/* Arrow head */}
            <polygon
              points={`${to.x},${to.y} ${arrowP1.x},${arrowP1.y} ${arrowP2.x},${arrowP2.y}`}
              fill={conn.color || '#64748b'}
              opacity={0.85}
            />
            {/* Label */}
            {conn.label && (
              <g>
                <rect
                  x={midX - conn.label.length * 3.5 - 4}
                  y={midY - 8}
                  width={conn.label.length * 7 + 8}
                  height={16}
                  rx="4"
                  fill="white"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#475569"
                  className="pointer-events-none"
                  fontWeight="500"
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Connecting mode line */}
      {connectingFrom && (() => {
        const from = getNodeCenter(connectingFrom);
        return (
          <circle cx={from.x} cy={from.y} r="8" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3">
            <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
};

export default ConnectionsLayer;
