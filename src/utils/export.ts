import { saveAs } from 'file-saver';
import { MindMapNode, NodeConnection } from '../types';

export function exportAsJSON(
  nodes: MindMapNode[],
  connections: NodeConnection[],
  title: string
): void {
  const data = { nodes, connections, title };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `${title || 'mindmap'}.json`);
}

export function importFromJSON(file: File): Promise<{ nodes: MindMapNode[]; connections: NodeConnection[]; title: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function exportAsMarkdown(
  nodes: MindMapNode[],
  connections: NodeConnection[],
  title: string
): void {
  let md = `# ${title}\n\n`;
  
  const rootNodes = nodes.filter(n => !n.parentId);
  
  const renderNode = (nodeId: string, depth: number): string => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return '';
    
    const indent = '  '.repeat(depth);
    let result = `${indent}- **${node.text}**\n`;
    
    if (node.links.length > 0) {
      node.links.forEach(link => {
        result += `${indent}  - 🔗 [${link}](${link})\n`;
      });
    }
    
    if (node.obsidianLinks.length > 0) {
      node.obsidianLinks.forEach(link => {
        result += `${indent}  - 📝 [[${link.noteName}]]\n`;
      });
    }
    
    if (node.checklist.length > 0) {
      node.checklist.forEach(item => {
        result += `${indent}  - [${item.checked ? 'x' : ' '}] ${item.text}\n`;
      });
    }
    
    node.children.forEach(childId => {
      result += renderNode(childId, depth + 1);
    });
    
    return result;
  };

  rootNodes.forEach(root => {
    md += renderNode(root.id, 0);
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  saveAs(blob, `${title || 'mindmap'}.md`);
}
