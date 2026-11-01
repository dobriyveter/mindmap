import React from 'react';
import { MindMapNode, NodeConnection } from '../types';
import useMindMapStore from '../store/mindmapStore';

interface Props {
  nodes: MindMapNode[];
  connections: NodeConnection[];
}

/**
 * Вычисляет точку на краю прямоугольника/эллипса узла в направлении к target
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
  
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
    return { x: cx + node.width / 2, y: cy };
  }
  
  const hw = node.width / 2;
  const hh = node.height / 2;
  
  if (node.shape === 'ellipse') {
    const angle = Math.atan2(dy, dx);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const r = (hw * hh) / Math.sqrt(hh * hh * cos * cos + hw * hw * sin * sin);
    return { x: cx + r * cos, y: cy + r * sin };
  }
  
  // Rectangle/rounded — пересечение с краем прямоугольника
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  let scale: number;
  if (absDx * hh > absDy * hw) {
    // Пересекает левый или правый край
    scale = hw / absDx;
  } else {
    // Пересекает верхний или нижний край
    scale = hh / absDy;
  }
  
  return { x: cx + dx * scale, y: cy + dy * scale };
}

/**
 * Генерирует tapered (сужающуюся) path от from к to.
 * Толстый у начала, тонкий у конца, с наконечником-стрелкой.
 */
function generateTaperedArrow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  startWidth: number,
  endWidth: number
): { path: string; arrowPoints: string } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 1) return { path: '', arrowPoints: '' };
  
  // Направление
  const nx = dx / dist; // нормализованный X
  const ny = dy / dist; // нормализованный Y
  // Перпендикуляр
  const px = -ny;
  const py = nx;
  
  // Контрольные точки для кривой Безье
  const cpDist = Math.min(dist * 0.4, 120);
  
  // Определяем изгиб в зависимости от направления
  let cp1x: number, cp1y: number, cp2x: number, cp2y: number;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Горизонтальное направление — изгиб по X
    cp1x = from.x + Math.sign(dx) * cpDist;
    cp1y = from.y;
    cp2x = to.x - Math.sign(dx) * cpDist;
    cp2y = to.y;
  } else {
    // Вертикальное направление — изгиб по Y
    cp1x = from.x;
    cp1y = from.y + Math.sign(dy) * cpDist;
    cp2x = to.x;
    cp2y = to.y - Math.sign(dy) * cpDist;
  }
  
  // Генерируем точки вдоль кривой для tapered shape
  const segments = 24;
  const leftEdge: string[] = [];
  const rightEdge: string[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    
    // Точка на кривой Безье
    const bx = mt*mt*mt*from.x + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*to.x;
    const by = mt*mt*mt*from.y + 3*mt*mt*t*cp1y + 3*mt*t*t*cp2y + t*t*t*to.y;
    
    // Касательная (производная)
    const tx = 3*mt*mt*(cp1x-from.x) + 6*mt*t*(cp2x-cp1x) + 3*t*t*(to.x-cp2x);
    const ty = 3*mt*mt*(cp1y-from.y) + 6*mt*t*(cp2y-cp1y) + 3*t*t*(to.y-cp2y);
    
    const tLen = Math.sqrt(tx*tx + ty*ty);
    if (tLen < 0.001) continue;
    
    // Перпендикуляр к касательной
    const ppx = -ty / tLen;
    const ppy = tx / tLen;
    
    // Плавное сужение (smoothstep)
    const eased = t * t * (3 - 2 * t);
    const w = startWidth + (endWidth - startWidth) * eased;
    const halfW = w / 2;
    
    leftEdge.push(`${bx + ppx * halfW},${by + ppy * halfW}`);
    rightEdge.push(`${bx - ppx * halfW},${by - ppy * halfW}`);
  }
  
  if (leftEdge.length < 2) return { path: '', arrowPoints: '' };
  
  // Наконечник стрелки
  const arrowLen = Math.max(endWidth * 3, 8);
  const arrowWidth = Math.max(endWidth * 2, 5);
  
  // Направление на конце кривой
  const endTx = 3*(to.x-cp2x);
  const endTy = 3*(to.y-cp2y);
  const endTLen = Math.sqrt(endTx*endTx + endTy*endTy);
  const endNx = endTx / (endTLen || 1);
  const endNy = endTy / (endTLen || 1);
  const endPx = -endNy;
  const endPy = endNx;
  
  const arrowTip = { x: to.x, y: to.y };
  const arrowLeft = { x: to.x - endNx * arrowLen + endPx * arrowWidth, y: to.y - endNy * arrowLen + endPy * arrowWidth };
  const arrowRight = { x: to.x - endNx * arrowLen - endPx * arrowWidth, y: to.y - endNy * arrowLen - endPy * arrowWidth };
  
  // Собираем path: левый край → наконечник → правый край (обратно)
  const path = `M ${leftEdge[0]} L ${leftEdge.slice(1).join(' L ')} L ${arrowLeft.x},${arrowLeft.y} L ${arrowTip.x},${arrowTip.y} L ${arrowRight.x},${arrowRight.y} L ${rightEdge.slice().reverse().join(' L ')} Z`;
  
  const arrowPoints = `${arrowTip.x},${arrowTip.y} ${arrowLeft.x},${arrowLeft.y} ${arrowRight.x},${arrowRight.y}`;
  
  return { path, arrowPoints };
}

const ConnectionsLayer: React.FC<Props> = ({ nodes, connections }) => {
  const { selectConnection, selectedConnectionId, connectingFrom } = useMindMapStore();

  // Отладка
  console.log('ConnectionsLayer:', { nodesCount: nodes.length, connectionsCount: connections.length, connections });

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  };

  // Определяем глубину узла для расчёта толщины
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
      width="10000"
      height="10000"
      viewBox="0 0 10000 10000"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.fromNodeId);
        const toNode = nodes.find(n => n.id === conn.toNodeId);
        if (!fromNode || !toNode) return null;

        const fromCenter = getNodeCenter(conn.fromNodeId);
        const toCenter = getNodeCenter(conn.toNodeId);
        
        // Точки на краях узлов
        const from = getEdgePoint(fromNode, toCenter.x, toCenter.y);
        const to = getEdgePoint(toNode, fromCenter.x, fromCenter.y);

        // Отладка
        console.log('Drawing connection:', { from, to, fromNode: fromNode.id, toNode: toNode.id });

        // Толщина зависит от глубины
        const depth = getNodeDepth(conn.fromNodeId);
        const startWidth = Math.max(8 - depth * 1.5, 2.5);
        const endWidth = Math.max(2 - depth * 0.3, 0.8);
        
        const isSelected = conn.id === selectedConnectionId;
        const sw = isSelected ? startWidth * 1.3 : startWidth;
        const ew = isSelected ? endWidth * 1.3 : endWidth;

        const { path, arrowPoints } = generateTaperedArrow(from, to, sw, ew);
        
        const color = conn.color || '#64748b';
        const selectedColor = '#3b82f6';

        // Метка посередине
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        return (
          <g key={conn.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); selectConnection(conn.id); }}>
            
            {/* Простая линия для отладки */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="orange" strokeWidth="3" opacity="0.8"
            />
            
            {/* Невидимая широкая область для клика */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="transparent" strokeWidth="16"
            />
            
            {/* Tapered стрелка */}
            {path && (
              <path
                d={path}
                fill={isSelected ? selectedColor : color}
                opacity={0.9}
                stroke={isSelected ? selectedColor : 'none'}
                strokeWidth={isSelected ? 1 : 0}
              />
            )}
            
            {/* Метка */}
            {conn.label && (
              <g>
                <rect
                  x={midX - conn.label.length * 3.5 - 6}
                  y={midY - 10}
                  width={conn.label.length * 7 + 12}
                  height={18}
                  rx="9"
                  fill="white"
                  stroke={isSelected ? selectedColor : '#e2e8f0'}
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

      {/* Индикатор режима создания связи */}
      {connectingFrom && (() => {
        const center = getNodeCenter(connectingFrom);
        return (
          <circle cx={center.x} cy={center.y} r="10" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,3">
            <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
};

export default ConnectionsLayer;
