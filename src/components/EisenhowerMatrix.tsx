import React, { useState } from 'react';
import useMindMapStore from '../store/mindmapStore';
import { EisenhowerTask, EisenhowerQuadrant, QuadrantConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

const QUADRANT_CONFIG: QuadrantConfig[] = [
  {
    id: 'A',
    title: 'A: Важно и Срочно',
    subtitle: 'Делать сейчас',
    action: 'Выполнить немедленно',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    icon: '🔥',
  },
  {
    id: 'B',
    title: 'B: Важно, Не срочно',
    subtitle: 'Запланировать',
    action: 'Запланировать время',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    icon: '📅',
  },
  {
    id: 'C',
    title: 'C: Не важно, Срочно',
    subtitle: 'Делегировать',
    action: 'Делегировать',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    icon: '🤝',
  },
  {
    id: 'D',
    title: 'D: Не важно, Не срочно',
    subtitle: 'Отказаться',
    action: 'Исключить',
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    icon: '🗑️',
  },
];

interface Props {
  onClose: () => void;
}

const EisenhowerMatrix: React.FC<Props> = ({ onClose }) => {
  const { nodes, eisenhowerTasks, addEisenhowerTask, updateEisenhowerTask, deleteEisenhowerTask, selectedNodeId } = useMindMapStore();
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant>('A');

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    const task: EisenhowerTask = {
      id: uuidv4(),
      text: newTaskText.trim(),
      quadrant: selectedQuadrant,
      done: false,
      createdAt: new Date().toISOString(),
      nodeId: selectedNodeId || undefined,
    };
    
    addEisenhowerTask(task);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    const task = eisenhowerTasks.find(t => t.id === taskId);
    if (task) {
      updateEisenhowerTask(taskId, { done: !task.done });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteEisenhowerTask(taskId);
  };

  const handleMoveTask = (taskId: string, newQuadrant: EisenhowerQuadrant) => {
    updateEisenhowerTask(taskId, { quadrant: newQuadrant });
  };

  const getTasksForQuadrant = (quadrant: EisenhowerQuadrant) => {
    return eisenhowerTasks.filter(t => t.quadrant === quadrant);
  };

  const getNodeName = (nodeId?: string) => {
    if (!nodeId) return null;
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.text : null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📊 Матрица Эйзенхауэра</h2>
            <p className="text-sm text-gray-500 mt-1">Управляйте задачами по приоритету</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Add task form */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Новая задача..."
            />
            <select
              value={selectedQuadrant}
              onChange={(e) => setSelectedQuadrant(e.target.value as EisenhowerQuadrant)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {QUADRANT_CONFIG.map(q => (
                <option key={q.id} value={q.id}>
                  {q.icon} {q.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              ➕ Добавить
            </button>
          </div>
          {selectedNodeId && (
            <p className="text-xs text-gray-500 mt-2">
              📌 Привязано к узлу: <strong>{getNodeName(selectedNodeId)}</strong>
            </p>
          )}
        </div>

        {/* Matrix */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {QUADRANT_CONFIG.map(config => {
              const tasks = getTasksForQuadrant(config.id);
              return (
                <div
                  key={config.id}
                  className="rounded-xl border-2 p-4 flex flex-col"
                  style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                  }}
                >
                  {/* Quadrant header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: config.color }}>
                          {config.title}
                        </h3>
                        <p className="text-xs text-gray-600">{config.subtitle}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {config.action}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: config.color, color: 'white' }}>
                        {tasks.length} {tasks.length === 1 ? 'задача' : 'задач'}
                      </span>
                    </div>
                  </div>

                  {/* Tasks list */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">Нет задач</p>
                    ) : (
                      tasks.map(task => (
                        <div
                          key={task.id}
                          className={`bg-white rounded-lg p-2 border ${task.done ? 'opacity-50' : ''}`}
                          style={{ borderColor: config.borderColor }}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => handleToggleTask(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {task.text}
                              </p>
                              {task.nodeId && (
                                <p className="text-xs text-gray-400 mt-1">
                                  📌 {getNodeName(task.nodeId)}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {/* Move to other quadrants */}
                              <select
                                value={task.quadrant}
                                onChange={(e) => handleMoveTask(task.id, e.target.value as EisenhowerQuadrant)}
                                className="text-xs border border-gray-200 rounded px-1 py-0.5"
                              >
                                {QUADRANT_CONFIG.map(q => (
                                  <option key={q.id} value={q.id}>
                                    {q.icon}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-400 hover:text-red-600 text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              Всего задач: <strong>{eisenhowerTasks.length}</strong> | 
              Выполнено: <strong>{eisenhowerTasks.filter(t => t.done).length}</strong>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
