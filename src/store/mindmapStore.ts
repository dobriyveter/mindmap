import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MindMapNode, NodeConnection, EisenhowerTask, Project } from '../types';

interface MindMapStore {
  // Nodes and connections
  nodes: MindMapNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  selectedNodeIds: string[];
  
  // Eisenhower tasks
  eisenhowerTasks: EisenhowerTask[];
  showEisenhowerMatrix: boolean;
  
  // Projects
  currentProjectId: string | null;
  projects: Project[];
  
  // UI state
  zoom: number;
  panX: number;
  panY: number;
  connectingFrom: string | null;
  theme: 'light' | 'dark';
  mapTitle: string;
  obsidianVaultPath: string;
  obsidianApiKey: string;
  isDirty: boolean;
  lastSaved: Date | null;
  showSettings: boolean;
  showTemplates: boolean;
  
  // View mode
  viewMode: {
    mode: 'edit' | 'focus' | 'presentation' | 'print';
    focusNodeId?: string;
  };
  
  // Actions
  addNode: (x: number, y: number, parentId?: string) => string;
  updateNode: (id: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null, multiSelect?: boolean) => void;
  selectConnection: (id: string | null) => void;
  addConnection: (fromId: string, toId: string, label?: string) => void;
  deleteConnection: (id: string) => void;
  
  // Eisenhower
  addEisenhowerTask: (task: EisenhowerTask) => void;
  updateEisenhowerTask: (id: string, updates: Partial<EisenhowerTask>) => void;
  deleteEisenhowerTask: (id: string) => void;
  getTasksByDate: (date: string) => EisenhowerTask[];
  getUpcomingTasks: (days: number) => EisenhowerTask[];
  getOverdueTasks: () => EisenhowerTask[];
  
  // Projects
  saveProject: () => void;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  createNewProject: () => void;
  loadProjects: () => void;
  
  // UI
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setConnectingFrom: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setMapTitle: (title: string) => void;
  setObsidianVaultPath: (path: string) => void;
  setObsidianApiKey: (key: string) => void;
  setViewMode: (mode: any) => void;
  connectSelectedNodes: () => void;
  clearMultiSelect: () => void;
}

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  selectedConnectionId: null,
  selectedNodeIds: [],
  eisenhowerTasks: [],
  showEisenhowerMatrix: false,
  currentProjectId: null,
  projects: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  connectingFrom: null,
  theme: 'light',
  mapTitle: 'Новый проект',
  obsidianVaultPath: '',
  obsidianApiKey: '',
  isDirty: false,
  lastSaved: null,
  viewMode: { mode: 'edit' },
  showSettings: false,
  showTemplates: false,
  
  addNode: (x, y, parentId) => {
    const id = uuidv4();
    const newNode: MindMapNode = {
      id,
      text: 'Новый узел',
      x,
      y,
      color: '#1a1a2e',
      backgroundColor: '#e8f4f8',
      fontSize: 14,
      fontWeight: 'normal',
      shape: 'rounded',
      parentId,
      children: [],
      links: [],
      obsidianLinks: [],
      checklist: [],
      collapsed: false,
      zIndex: 1,
      width: 200,
      height: 80,
    };
    
    set(state => {
      const nodes = [...state.nodes, newNode];
      const connections = [...state.connections];
      
      if (parentId) {
        const parentIndex = nodes.findIndex(n => n.id === parentId);
        if (parentIndex !== -1) {
          nodes[parentIndex] = {
            ...nodes[parentIndex],
            children: [...nodes[parentIndex].children, id]
          };
        }
        connections.push({
          id: uuidv4(),
          fromNodeId: parentId,
          toNodeId: id,
          style: 'solid',
        });
      }
      
      return { nodes, connections, selectedNodeId: id, isDirty: true };
    });
    
    return id;
  },
  
  updateNode: (id, updates) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
      isDirty: true,
    }));
  },
  
  deleteNode: (id) => {
    const state = get();
    const nodeToDelete = state.nodes.find(n => n.id === id);
    if (!nodeToDelete) return;

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
  },
  
  selectNode: (id, multiSelect = false) => {
    if (id === null) {
      set({ selectedNodeId: null, selectedNodeIds: [], selectedConnectionId: null });
      return;
    }
    if (multiSelect) {
      set(state => {
        const ids = state.selectedNodeIds.includes(id)
          ? state.selectedNodeIds.filter(i => i !== id)
          : [...state.selectedNodeIds, id];
        return { selectedNodeId: id, selectedNodeIds: ids, selectedConnectionId: null };
      });
    } else {
      set({ selectedNodeId: id, selectedNodeIds: [id], selectedConnectionId: null });
    }
  },
  
  selectConnection: (id) => set({ selectedConnectionId: id, selectedNodeId: null, selectedNodeIds: [] }),
  
  addConnection: (fromId, toId, label) => {
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
  },
  
  deleteConnection: (id) => {
    set(state => ({
      connections: state.connections.filter(c => c.id !== id),
      selectedConnectionId: null,
      isDirty: true,
    }));
  },
  
  addEisenhowerTask: (task) => {
    set(state => ({
      eisenhowerTasks: [...state.eisenhowerTasks, task],
    }));
  },
  
  updateEisenhowerTask: (id, updates) => {
    set(state => ({
      eisenhowerTasks: state.eisenhowerTasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },
  
  deleteEisenhowerTask: (id) => {
    set(state => ({
      eisenhowerTasks: state.eisenhowerTasks.filter(t => t.id !== id),
    }));
  },
  
  getTasksByDate: (date) => {
    const state = get();
    return state.eisenhowerTasks.filter(t => t.dueDate === date);
  },
  
  getUpcomingTasks: (days) => {
    const state = get();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return state.eisenhowerTasks.filter(t => {
      if (!t.dueDate || t.done) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate >= now && taskDate <= futureDate;
    }).sort((a, b) => {
      const dateA = new Date(a.dueDate!);
      const dateB = new Date(b.dueDate!);
      return dateA.getTime() - dateB.getTime();
    });
  },
  
  getOverdueTasks: () => {
    const state = get();
    const now = new Date();
    
    return state.eisenhowerTasks.filter(t => {
      if (!t.dueDate || t.done) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate < now;
    });
  },
  
  saveProject: () => {
    const state = get();
    const projectId = state.currentProjectId || uuidv4();
    const now = new Date().toISOString();
    
    const project: Project = {
      id: projectId,
      name: state.mapTitle || 'Без названия',
      createdAt: state.projects.find(p => p.id === projectId)?.createdAt || now,
      updatedAt: now,
      data: {
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        connections: JSON.parse(JSON.stringify(state.connections)),
        eisenhowerTasks: JSON.parse(JSON.stringify(state.eisenhowerTasks)),
      },
    };

    set(state => {
      const existingIndex = state.projects.findIndex(p => p.id === projectId);
      const newProjects = [...state.projects];
      if (existingIndex >= 0) {
        newProjects[existingIndex] = project;
      } else {
        newProjects.push(project);
      }
      
      localStorage.setItem('mindflow_projects', JSON.stringify(newProjects));
      
      return {
        projects: newProjects,
        currentProjectId: projectId,
        isDirty: false,
        lastSaved: new Date(),
      };
    });
  },
  
  loadProject: (projectId) => {
    const state = get();
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    set({
      nodes: JSON.parse(JSON.stringify(project.data.nodes)),
      connections: JSON.parse(JSON.stringify(project.data.connections)),
      eisenhowerTasks: JSON.parse(JSON.stringify(project.data.eisenhowerTasks)),
      mapTitle: project.name,
      currentProjectId: projectId,
      selectedNodeId: null,
      selectedNodeIds: [],
      selectedConnectionId: null,
      isDirty: false,
    });
  },
  
  deleteProject: (projectId) => {
    set(state => {
      const newProjects = state.projects.filter(p => p.id !== projectId);
      localStorage.setItem('mindflow_projects', JSON.stringify(newProjects));
      
      return {
        projects: newProjects,
        currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,
      };
    });
  },
  
  createNewProject: () => {
    set({
      nodes: [],
      connections: [],
      eisenhowerTasks: [],
      mapTitle: 'Новый проект',
      currentProjectId: null,
      selectedNodeId: null,
      selectedNodeIds: [],
      selectedConnectionId: null,
      isDirty: false,
    });
  },
  
  loadProjects: () => {
    const data = localStorage.getItem('mindflow_projects');
    if (data) {
      try {
        const projects = JSON.parse(data);
        set({ projects });
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  },
  
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  setConnectingFrom: (id) => set({ connectingFrom: id }),
  setTheme: (theme) => set({ theme }),
  setMapTitle: (title) => set({ mapTitle: title, isDirty: true }),
  setObsidianVaultPath: (path) => {
    set({ obsidianVaultPath: path });
    localStorage.setItem('mindflow_obsidian_vault_path', path);
  },
  setObsidianApiKey: (key) => {
    set({ obsidianApiKey: key });
    localStorage.setItem('mindflow_obsidian_api_key', key);
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  connectSelectedNodes: () => {
    const { selectedNodeIds } = get();
    if (selectedNodeIds.length < 2) return;
    
    set(state => {
      const newConnections = [...state.connections];
      for (let i = 0; i < selectedNodeIds.length - 1; i++) {
        const fromId = selectedNodeIds[i];
        const toId = selectedNodeIds[i + 1];
        const exists = newConnections.some(
          c => (c.fromNodeId === fromId && c.toNodeId === toId) ||
               (c.fromNodeId === toId && c.toNodeId === fromId)
        );
        if (!exists) {
          newConnections.push({
            id: uuidv4(),
            fromNodeId: fromId,
            toNodeId: toId,
            style: 'solid',
          });
        }
      }
      return { connections: newConnections, selectedNodeIds: [], isDirty: true };
    });
  },
  clearMultiSelect: () => set({ selectedNodeIds: [] }),
}));
