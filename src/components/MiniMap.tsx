import React from 'react';
import useMindMapStore from '../store/mindmapStore';

const MiniMap: React.FC = () => {
  const { nodes, connections, zoom, panX, panY, setPan, setZoom, viewMode } = useMindMapStore();

  if (viewMode.mode === 'presentation' || viewMode.mode === 'print') return null;
  if (nodes.length === 0) return null;

  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  const padding = 50;
  const mapWidth = maxX - minX + padding * 2;
  const mapHeight = maxY - minY + padding * 2;
  
  const miniMapWidth = 180;
  const miniMapHeight = 120;
  const scale = Math.min(miniMapWidth / mapWidth, miniMapHeight / mapHeight);

  // Viewport rectangle
  const viewportWidth = window.innerWidth / zoom;
  const viewportHeight = window.innerHeight / zoom;
  const vpX = (-panX / zoom - minX + padding) * scale;
  const vpY = (-panY / zoom - minY + padding) * scale;
  const vpW = viewportWidth * scale;
  const vpH = viewportHeight * scale;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale + minX - padding;
    const clickY = (e.clientY - rect.top) / scale + minY - padding;
    
    setPan(-(clickX * zoom - window.innerWidth / 2), -(clickY * zoom - window.innerHeight / 2));
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <svg
        width={miniMapWidth}
        height={miniMapHeight}
        className="cursor-pointer"
        onClick={handleClick}
      >
        {/* Background */}
        <rect width={miniMapWidth} height={miniMapHeight} fill="#f8fafc" />

        {/* Connections */}
        {connections.map(conn => {
          const from = nodes.find(n => n.id === conn.fromNodeId);
          const to = nodes.find(n => n.id === conn.toNodeId);
          if (!from || !to) return null;
          
          const x1 = (from.x + from.width / 2 - minX + padding) * scale;
          const y1 = (from.y + from.height / 2 - minY + padding) * scale;
          const x2 = (to.x + to.width / 2 - minX + padding) * scale;
          const y2 = (to.y + to.height / 2 - minY + padding) * scale;
          
          return (
            <line
              key={conn.id}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <rect
            key={node.id}
            x={(node.x - minX + padding) * scale}
            y={(node.y - minY + padding) * scale}
            width={Math.max(node.width * scale, 3)}
            height={Math.max(node.height * scale, 2)}
            fill={node.backgroundColor}
            stroke="#94a3b8"
            strokeWidth="0.5"
            rx="1"
          />
        ))}

        {/* Viewport */}
        <rect
          x={Math.max(0, vpX)}
          y={Math.max(0, vpY)}
          width={Math.min(vpW, miniMapWidth)}
          height={Math.min(vpH, miniMapHeight)}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          rx="2"
        />
      </svg>
    </div>
  );
};

export default MiniMap;
