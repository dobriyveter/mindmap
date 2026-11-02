import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { MindMapNode, NodeConnection } from '../types';

/**
 * Export mind map as PNG image
 */
export async function exportAsPNG(
  container: HTMLElement,
  filename: string = 'mindmap'
): Promise<void> {
  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}.png`);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Failed to export as PNG:', error);
    alert('Ошибка экспорта в PNG');
  }
}

/**
 * Export mind map as SVG
 */
export function exportAsSVG(
  nodes: MindMapNode[],
  connections: NodeConnection[],
  filename: string = 'mindmap'
): void {
  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  const padding = 50;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - padding} ${minY - padding} ${width} ${height}">`;
  
  // Add styles
  svg += `<style>
    text { font-family: sans-serif; }
    .node-text { font-size: 14px; }
    .connection { fill: none; stroke: #64748b; stroke-width: 2; }
  </style>`;

  // Draw connections
  connections.forEach(conn => {
    const from = nodes.find(n => n.id === conn.fromNodeId);
    const to = nodes.find(n => n.id === conn.toNodeId);
    if (!from || !to) return;

    const x1 = from.x + from.width / 2;
    const y1 = from.y + from.height / 2;
    const x2 = to.x + to.width / 2;
    const y2 = to.y + to.height / 2;

    svg += `<path class="connection" d="M ${x1} ${y1} C ${x1 + (x2-x1)*0.3} ${y1}, ${x2 - (x2-x1)*0.3} ${y2}, ${x2} ${y2}" />`;
  });

  // Draw nodes
  nodes.forEach(node => {
    const rx = node.shape === 'ellipse' ? node.width / 2 : node.shape === 'rounded' ? 12 : 0;
    svg += `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" 
      rx="${rx}" fill="${node.backgroundColor}" stroke="#94a3b8" stroke-width="1" />`;
    svg += `<text x="${node.x + node.width/2}" y="${node.y + node.height/2 + 5}" 
      text-anchor="middle" class="node-text" fill="${node.color}">${escapeXml(node.text)}</text>`;
  });

  svg += '</svg>';

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  saveAs(blob, `${filename}.svg`);
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * Export as Markdown (for Obsidian compatibility)
 */
export function exportAsMarkdown(
  nodes: MindMapNode[],
  connections: NodeConnection[],
  title: string
): string {
  let md = `# ${title}\n\n`;
  md += `> Exported from MindFlow on ${new Date().toLocaleDateString()}\n\n`;

  // Find root nodes (no parent)
  const rootNodes = nodes.filter(n => !n.parentId);
  
  const renderNode = (nodeId: string, depth: number): string => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return '';
    
    const indent = '  '.repeat(depth);
    let result = `${indent}- **${node.text}**\n`;
    
    // Add links
    if (node.links.length > 0) {
      node.links.forEach(link => {
        result += `${indent}  - 🔗 [${link}](${link})\n`;
      });
    }
    
    // Add Obsidian links
    if (node.obsidianLinks.length > 0) {
      node.obsidianLinks.forEach(link => {
        result += `${indent}  - 📝 [[${link.noteName}]]\n`;
      });
    }
    
    // Add checklist
    if (node.checklist.length > 0) {
      node.checklist.forEach(item => {
        result += `${indent}  - [${item.checked ? 'x' : ' '}] ${item.text}\n`;
      });
    }
    
    // Add notes
    if (node.notes) {
      result += `${indent}  > ${node.notes}\n`;
    }
    
    // Render children
    node.children.forEach(childId => {
      result += renderNode(childId, depth + 1);
    });
    
    return result;
  };

  rootNodes.forEach(root => {
    md += renderNode(root.id, 0);
  });

  return md;
}

/**
 * Download markdown file
 */
export function downloadMarkdown(
  nodes: MindMapNode[],
  connections: NodeConnection[],
  title: string
): void {
  const md = exportAsMarkdown(nodes, connections, title);
  const blob = new Blob([md], { type: 'text/markdown' });
  saveAs(blob, `${title || 'mindmap'}.md`);
}
