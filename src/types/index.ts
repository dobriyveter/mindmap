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

export type EisenhowerQuadrant = 'A' | 'B' | 'C' | 'D';

export interface EisenhowerTask {
  id: string;
  text: string;
  quadrant: EisenhowerQuadrant;
  done: boolean;
  createdAt: string;
  nodeId?: string; // привязка к узлу карты
  dueDate?: string; // дата выполнения (ISO string)
  dueTime?: string; // время выполнения (HH:MM)
  reminder?: string; // напоминание (ISO datetime)
  timeEstimate?: number; // оценка времени в минутах
  recurring?: 'daily' | 'weekly' | 'monthly' | null; // повторение
  priority?: number; // приоритет 1-10
}

export interface CalendarEvent {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  duration?: number; // в минутах
  title: string;
  quadrant: EisenhowerQuadrant;
  done: boolean;
}

export interface QuadrantConfig {
  id: EisenhowerQuadrant;
  title: string;
  subtitle: string;
  action: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
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

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodesCount: number;
  connectionsCount: number;
  data: {
    nodes: MindMapNode[];
    connections: NodeConnection[];
  };
}

export interface MindMapState {
  nodes: MindMapNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  selectedNodeIds: string[]; // для множественного выделения
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
  obsidianApiKey: string;
  currentProjectId: string | null;
  projects: Project[];
}
