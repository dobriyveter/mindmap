import React from 'react';
import useMindMapStore from '../store/mindmapStore';
import { MindMapNode, NodeConnection } from '../types';
import { v4 as uuidv4 } from 'uuid';

const templates: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  generate: () => { nodes: MindMapNode[]; connections: NodeConnection[] };
}> = [
  {
    id: 'brainstorm',
    name: 'Брейншторм',
    description: 'Центральная идея с расходящимися ветвями',
    icon: '💡',
    generate: () => {
      const centerId = uuidv4();
      const branchIds = Array.from({ length: 5 }, () => uuidv4());
      
      const nodes: MindMapNode[] = [
        {
          id: centerId, x: 400, y: 300, width: 200, height: 80,
          text: 'Центральная идея', color: '#1a1a2e', backgroundColor: '#fef3c7',
          fontSize: 18, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: branchIds, collapsed: false, shape: 'ellipse', zIndex: 10,
        },
        ...branchIds.map((id, i) => ({
          id, x: 200 + (i % 3) * 250, y: 100 + Math.floor(i / 3) * 200,
          width: 160, height: 60, text: `Ветка ${i + 1}`, color: '#1a1a2e',
          backgroundColor: ['#e8f4f8', '#fce7f3', '#d1fae5', '#ede9fe', '#fee2e2'][i],
          fontSize: 14, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: centerId, collapsed: false, shape: 'rounded' as const, zIndex: 5,
        })),
      ];

      const connections: NodeConnection[] = branchIds.map(toId => ({
        id: uuidv4(), fromNodeId: centerId, toNodeId: toId, style: 'solid' as const,
      }));

      return { nodes, connections };
    },
  },
  {
    id: 'project-plan',
    name: 'План проекта',
    description: 'Структура проекта с задачами',
    icon: '📋',
    generate: () => {
      const rootId = uuidv4();
      const phaseIds = Array.from({ length: 3 }, () => uuidv4());
      const taskIds = Array.from({ length: 6 }, () => uuidv4());

      const nodes: MindMapNode[] = [
        {
          id: rootId, x: 400, y: 250, width: 220, height: 80,
          text: '🚀 Название проекта', color: '#fff', backgroundColor: '#1e40af',
          fontSize: 18, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: phaseIds, collapsed: false, shape: 'rounded', zIndex: 10,
        },
        ...phaseIds.map((id, i) => ({
          id, x: 150 + i * 300, y: 400, width: 180, height: 60,
          text: ['📅 Планирование', '⚡ Разработка', '🚀 Запуск'][i],
          color: '#1a1a2e', backgroundColor: ['#dbeafe', '#fef3c7', '#d1fae5'][i],
          fontSize: 14, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [taskIds[i * 2], taskIds[i * 2 + 1]],
          parentId: rootId, collapsed: false, shape: 'rounded' as const, zIndex: 5,
        })),
        ...taskIds.map((id, i) => ({
          id, x: 100 + (i % 3) * 300, y: 520 + Math.floor(i / 3) * 80,
          width: 150, height: 50, text: `Задача ${i + 1}`,
          color: '#1a1a2e', backgroundColor: '#f8fafc',
          fontSize: 12, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: phaseIds[Math.floor(i / 2)],
          collapsed: false, shape: 'rounded' as const, zIndex: 3,
        })),
      ];

      const connections: NodeConnection[] = [
        ...phaseIds.map(toId => ({ id: uuidv4(), fromNodeId: rootId, toNodeId: toId, style: 'solid' as const })),
        ...taskIds.map((toId, i) => ({ id: uuidv4(), fromNodeId: phaseIds[Math.floor(i / 2)], toNodeId: toId, style: 'solid' as const })),
      ];

      return { nodes, connections };
    },
  },
  {
    id: 'decision-tree',
    name: 'Дерево решений',
    description: 'Варианты и последствия',
    icon: '🌳',
    generate: () => {
      const rootId = uuidv4();
      const optA = uuidv4(), optB = uuidv4();
      const prosA = uuidv4(), consA = uuidv4(), prosB = uuidv4(), consB = uuidv4();

      const nodes: MindMapNode[] = [
        {
          id: rootId, x: 400, y: 200, width: 200, height: 80,
          text: '🤔 Решение?', color: '#fff', backgroundColor: '#7c3aed',
          fontSize: 16, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [optA, optB], collapsed: false, shape: 'diamond', zIndex: 10,
        },
        {
          id: optA, x: 200, y: 350, width: 160, height: 60,
          text: 'Вариант A', color: '#1a1a2e', backgroundColor: '#d1fae5',
          fontSize: 14, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [prosA, consA], parentId: rootId, collapsed: false, shape: 'rounded', zIndex: 5,
        },
        {
          id: optB, x: 550, y: 350, width: 160, height: 60,
          text: 'Вариант B', color: '#1a1a2e', backgroundColor: '#fee2e2',
          fontSize: 14, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [prosB, consB], parentId: rootId, collapsed: false, shape: 'rounded', zIndex: 5,
        },
        {
          id: prosA, x: 100, y: 470, width: 140, height: 50,
          text: '✅ Плюсы', color: '#065f46', backgroundColor: '#ecfdf5',
          fontSize: 12, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: optA, collapsed: false, shape: 'rounded', zIndex: 3,
        },
        {
          id: consA, x: 270, y: 470, width: 140, height: 50,
          text: '❌ Минусы', color: '#991b1b', backgroundColor: '#fef2f2',
          fontSize: 12, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: optA, collapsed: false, shape: 'rounded', zIndex: 3,
        },
        {
          id: prosB, x: 470, y: 470, width: 140, height: 50,
          text: '✅ Плюсы', color: '#065f46', backgroundColor: '#ecfdf5',
          fontSize: 12, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: optB, collapsed: false, shape: 'rounded', zIndex: 3,
        },
        {
          id: consB, x: 640, y: 470, width: 140, height: 50,
          text: '❌ Минусы', color: '#991b1b', backgroundColor: '#fef2f2',
          fontSize: 12, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: optB, collapsed: false, shape: 'rounded', zIndex: 3,
        },
      ];

      const connections: NodeConnection[] = [
        { id: uuidv4(), fromNodeId: rootId, toNodeId: optA, style: 'solid' },
        { id: uuidv4(), fromNodeId: rootId, toNodeId: optB, style: 'solid' },
        { id: uuidv4(), fromNodeId: optA, toNodeId: prosA, style: 'solid' },
        { id: uuidv4(), fromNodeId: optA, toNodeId: consA, style: 'solid' },
        { id: uuidv4(), fromNodeId: optB, toNodeId: prosB, style: 'solid' },
        { id: uuidv4(), fromNodeId: optB, toNodeId: consB, style: 'solid' },
      ];

      return { nodes, connections };
    },
  },
  {
    id: 'mindmap-basic',
    name: 'Простая карта',
    description: 'Минимальная структура для начала',
    icon: '🗺️',
    generate: () => {
      const rootId = uuidv4();
      const child1 = uuidv4(), child2 = uuidv4(), child3 = uuidv4();
      
      const nodes: MindMapNode[] = [
        {
          id: rootId, x: 400, y: 280, width: 180, height: 70,
          text: 'Центральная тема', color: '#fff', backgroundColor: '#3b82f6',
          fontSize: 16, fontWeight: 'bold', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [child1, child2, child3], collapsed: false, shape: 'ellipse', zIndex: 10,
        },
        {
          id: child1, x: 150, y: 150, width: 150, height: 55,
          text: 'Ветка 1', color: '#1a1a2e', backgroundColor: '#e0f2fe',
          fontSize: 14, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: rootId, collapsed: false, shape: 'rounded', zIndex: 5,
        },
        {
          id: child2, x: 650, y: 150, width: 150, height: 55,
          text: 'Ветка 2', color: '#1a1a2e', backgroundColor: '#fce7f3',
          fontSize: 14, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: rootId, collapsed: false, shape: 'rounded', zIndex: 5,
        },
        {
          id: child3, x: 400, y: 450, width: 150, height: 55,
          text: 'Ветка 3', color: '#1a1a2e', backgroundColor: '#d1fae5',
          fontSize: 14, fontWeight: 'normal', links: [], checklist: [], obsidianLinks: [],
          attachedFiles: [], children: [], parentId: rootId, collapsed: false, shape: 'rounded', zIndex: 5,
        },
      ];

      const connections: NodeConnection[] = [
        { id: uuidv4(), fromNodeId: rootId, toNodeId: child1, style: 'solid' },
        { id: uuidv4(), fromNodeId: rootId, toNodeId: child2, style: 'solid' },
        { id: uuidv4(), fromNodeId: rootId, toNodeId: child3, style: 'solid' },
      ];

      return { nodes, connections };
    },
  },
];

const TemplateModal: React.FC = () => {
  const { showTemplates, setShowTemplates, loadTemplate } = useMindMapStore();

  if (!showTemplates) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">📋 Шаблоны ментальных карт</h2>
          <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => {
                const { nodes, connections } = template.generate();
                loadTemplate(nodes, connections);
                setShowTemplates(false);
              }}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left"
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <h3 className="font-semibold text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            💡 Выберите шаблон для быстрого старта. Вы можете изменить все элементы после загрузки.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
