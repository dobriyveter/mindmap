export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: string;
  shape: 'rectangle' | 'rounded' | 'ellipse' | 'diamond';
  parentId?: string;
  children: string[];
  links: string[];
  obsidianLinks: ObsidianLink[];
  checklist: ChecklistItem[];
  imageUrl?: string;
  notes?: string;
  collapsed: boolean;
  zIndex: number;
  width: number;
  height: number;
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface ObsidianLink {
  vaultPath: string;
  noteName: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export type EisenhowerQuadrant = 'A' | 'B' | 'C' | 'D';

export interface EisenhowerTask {
  id: string;
  text: string;
  quadrant: EisenhowerQuadrant;
  done: boolean;
  createdAt: string;
  nodeId?: string;
  dueDate?: string;
  dueTime?: string;
  timeEstimate?: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: {
    nodes: MindMapNode[];
    connections: NodeConnection[];
    eisenhowerTasks: EisenhowerTask[];
  };
}
