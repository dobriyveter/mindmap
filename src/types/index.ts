export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
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

export interface MindMapNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: string;
  imageUrl?: string;
  links: string[]; // web links
  checklist: ChecklistItem[];
  obsidianLinks: ObsidianLink[];
  attachedFiles: string[];
  children: string[]; // child node ids
  parentId?: string;
  collapsed: boolean;
  shape: 'rectangle' | 'rounded' | 'ellipse' | 'diamond';
  zIndex: number;
  notes?: string;
}

export interface MindMapTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: MindMapNode[];
  connections: NodeConnection[];
}

export interface ViewMode {
  mode: 'edit' | 'focus' | 'presentation' | 'print';
  focusNodeId?: string;
}

export interface MindMapState {
  nodes: MindMapNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  viewMode: ViewMode;
  zoom: number;
  panX: number;
  panY: number;
  history: { nodes: MindMapNode[]; connections: NodeConnection[] }[];
  historyIndex: number;
  isDirty: boolean;
  lastSaved: Date | null;
  mapTitle: string;
  theme: 'light' | 'dark';
  obsidianVaultPath: string;
}
