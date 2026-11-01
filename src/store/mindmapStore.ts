import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MindMapNode, NodeConnection, ViewMode, ChecklistItem, ObsidianLink } from '../types';

interface MindMapStore {
  // State
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
  showTemplates: boolean;
  showSettings: boolean;
  connectingFrom: string | null;

  // Actions
  addNode: (x: number, y: number, parentId?: string) => string;
  updateNode: (id: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  selectConnection: (id: string | null) => void;
  addConnection: (fromId: string, toId: string, label?: string) => void;
  deleteConnection: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
  setMapTitle: (title: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setObsidianVaultPath: (path: string) => void;
  setShowTemplates: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setConnectingFrom: (id: string | null) => void;
  loadTemplate: (nodes: MindMapNode[], connections: NodeConnection[]) => void;
  importMap: (data: { nodes: MindMapNode[]; connections: NodeConnection[]; title: string }) => void;
  exportMap: () => { nodes: MindMapNode[]; connections: NodeConnection[]; title: string };
  addChecklistItem: (nodeId: string) => void;
  updateChecklistItem: (nodeId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (nodeId: string, itemId: string) => void;
  addObsidianLink: (nodeId: string, link: ObsidianLink) => void;
  removeObsidianLink: (nodeId: string, linkIndex: number) => void;
  addWebLink: (nodeId: string, url: string) => void;
  removeWebLink: (nodeId: string, linkIndex: number) => void;
  toggleCollapse: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
}

const createDefaultNode = (x: number, y: number, parentId?: string): MindMapNode => ({
  id: uuidv4(),
  x,
  y,
  width: 200,
  height: 80,
  text: 'Новый узел',
  color: '#1a1a2e',
  backgroundColor: '#e8f4f8',
  fontSize: 14,
  fontWeight: 'normal',
  links: [],
  checklist: [],
  obsidianLinks: [],
  attachedFiles: [],
  children: [],
  parentId,
  collapsed: false,
  shape: 'rounded',
  zIndex: 1,
  notes: '',
});

const useMindMapStore = create<MindMapStore>((set, get) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  selectedConnectionId: null,
  viewMode: { mode: 'edit' },
  zoom: 1,
  panX: 0,
  panY: 0,
  history: [],
  historyIndex: -1,
  isDirty: false,
  lastSaved: null,
  mapTitle: 'Без названия',
  theme: 'light',
  obsidianVaultPath: '',
  showTemplates: false,
  showSettings: false,
  connectingFrom: null,

  addNode: (x: number, y: number, parentId?: string) => {
    const id = uuidv4();
    const newNode = createDefaultNode(x, y, parentId);
    newNode.id = id;
    
    set(state => {
      const nodes = [...state.nodes, newNode];
      let connections = [...state.connections];
      
      if (parentId) {
        const parentIndex = nodes.findIndex(n => n.id === parentId);
        if (parentIndex !== -1) {
          nodes[parentIndex] = {
            ...nodes[parentIndex],
            children: [...nodes[parentIndex].children, id]
          };
        }
        // Автоматически создаём визуальную связь между родителем и дочерним узлом
        const connectionExists = connections.some(
          c => c.fromNodeId === parentId && c.toNodeId === id
        );
        if (!connectionExists) {
          connections.push({
            id: uuidv4(),
            fromNodeId: parentId,
            toNodeId: id,
            style: 'solid',
          });
        }
      }
      return { nodes, connections, selectedNodeId: id, isDirty: true };
    });
    
    get().saveToHistory();
    return id;
  },

  updateNode: (id: string, updates: Partial<MindMapNode>) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
      isDirty: true,
    }));
  },

  deleteNode: (id: string) => {
    const state = get();
    const nodeToDelete = state.nodes.find(n => n.id === id);
    if (!nodeToDelete) return;

    // Collect all descendant ids
    const idsToDelete = new Set<string>();
    const collectDescendants = (nodeId: string) => {
      idsToDelete.add(nodeId);
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.children.forEach(childId => collectDescendants(childId));
      }
    };
    collectDescendants(id);

    set(state => ({
      nodes: state.nodes
        .filter(n => !idsToDelete.has(n.id))
        .map(n => ({
          ...n,
          children: n.children.filter(c => !idsToDelete.has(c)),
        })),
      connections: state.connections.filter(
        c => !idsToDelete.has(c.fromNodeId) && !idsToDelete.has(c.toNodeId)
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isDirty: true,
    }));
    get().saveToHistory();
  },

  selectNode: (id: string | null) => set({ selectedNodeId: id, selectedConnectionId: null }),
  selectConnection: (id: string | null) => set({ selectedConnectionId: id, selectedNodeId: null }),

  addConnection: (fromId: string, toId: string, label?: string) => {
    const newConnection: NodeConnection = {
      id: uuidv4(),
      fromNodeId: fromId,
      toNodeId: toId,
      label,
      style: 'solid',
    };
    set(state => ({
      connections: [...state.connections, newConnection],
      isDirty: true,
    }));
    get().saveToHistory();
  },

  deleteConnection: (id: string) => {
    set(state => ({
      connections: state.connections.filter(c => c.id !== id),
      selectedConnectionId: null,
      isDirty: true,
    }));
    get().saveToHistory();
  },

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  setZoom: (zoom: number) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  setPan: (x: number, y: number) => set({ panX: x, panY: y }),

  saveToHistory: () => {
    const { nodes, connections, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), connections: JSON.parse(JSON.stringify(connections)) });
    // Keep max 50 history states
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    set({
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      connections: JSON.parse(JSON.stringify(state.connections)),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    set({
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      connections: JSON.parse(JSON.stringify(state.connections)),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  saveToLocal: () => {
    const { nodes, connections, mapTitle } = get();
    const data = { nodes, connections, title: mapTitle, savedAt: new Date().toISOString() };
    localStorage.setItem('mindflow_map', JSON.stringify(data));
    set({ isDirty: false, lastSaved: new Date() });
  },

  loadFromLocal: () => {
    const data = localStorage.getItem('mindflow_map');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        set({
          nodes: parsed.nodes || [],
          connections: parsed.connections || [],
          mapTitle: parsed.title || 'Без названия',
          lastSaved: parsed.savedAt ? new Date(parsed.savedAt) : null,
          isDirty: false,
        });
      } catch (e) {
        console.error('Failed to load from localStorage', e);
      }
    }
  },

  setMapTitle: (title: string) => set({ mapTitle: title, isDirty: true }),
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  setObsidianVaultPath: (path: string) => set({ obsidianVaultPath: path }),
  setShowTemplates: (show: boolean) => set({ showTemplates: show }),
  setShowSettings: (show: boolean) => set({ showSettings: show }),
  setConnectingFrom: (id: string | null) => set({ connectingFrom: id }),

  loadTemplate: (nodes: MindMapNode[], connections: NodeConnection[]) => {
    set({ nodes, connections, selectedNodeId: null, isDirty: true });
    get().saveToHistory();
  },

  importMap: (data) => {
    set({
      nodes: data.nodes,
      connections: data.connections,
      mapTitle: data.title,
      isDirty: false,
    });
    get().saveToHistory();
  },

  exportMap: () => {
    const { nodes, connections, mapTitle } = get();
    return { nodes, connections, title: mapTitle };
  },

  addChecklistItem: (nodeId: string) => {
    const newItem: ChecklistItem = { id: uuidv4(), text: '', checked: false };
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, checklist: [...n.checklist, newItem] } : n
      ),
      isDirty: true,
    }));
  },

  updateChecklistItem: (nodeId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId
          ? { ...n, checklist: n.checklist.map(item => item.id === itemId ? { ...item, ...updates } : item) }
          : n
      ),
      isDirty: true,
    }));
  },

  deleteChecklistItem: (nodeId: string, itemId: string) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId
          ? { ...n, checklist: n.checklist.filter(item => item.id !== itemId) }
          : n
      ),
      isDirty: true,
    }));
  },

  addObsidianLink: (nodeId: string, link: ObsidianLink) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, obsidianLinks: [...n.obsidianLinks, link] } : n
      ),
      isDirty: true,
    }));
  },

  removeObsidianLink: (nodeId: string, linkIndex: number) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId
          ? { ...n, obsidianLinks: n.obsidianLinks.filter((_, i) => i !== linkIndex) }
          : n
      ),
      isDirty: true,
    }));
  },

  addWebLink: (nodeId: string, url: string) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, links: [...n.links, url] } : n
      ),
      isDirty: true,
    }));
  },

  removeWebLink: (nodeId: string, linkIndex: number) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId
          ? { ...n, links: n.links.filter((_, i) => i !== linkIndex) }
          : n
      ),
      isDirty: true,
    }));
  },

  toggleCollapse: (nodeId: string) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n
      ),
    }));
  },

  duplicateNode: (nodeId: string) => {
    const state = get();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const newNode = { ...node, id: uuidv4(), x: node.x + 30, y: node.y + 30 };
    set(state => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
      isDirty: true,
    }));
    get().saveToHistory();
  },
}));

export default useMindMapStore;
