import React, { useState } from 'react';
import { useMindMapStore } from '../store/mindmapStore';
import { EisenhowerTask, EisenhowerQuadrant } from '../types';
import { v4 as uuidv4 } from 'uuid';

const QUADRANT_CONFIG = [
  { id: 'A' as const, title: 'A: Важно и Срочно', subtitle: 'Делать сейчас', color: '#dc2626', bgColor: '#fef2f2', icon: '🔥' },
  { id: 'B' as const, title: 'B: Важно, Не срочно', subtitle: 'Запланировать', color: '#ea580c', bgColor: '#fff7ed', icon: '📅' },
  { id: 'C' as const, title: 'C: Не важно, Срочно', subtitle: 'Делегировать', color: '#2563eb', bgColor: '#eff6ff', icon: '🤝' },
  { id: 'D' as const, title: 'D: Не важно, Не срочно', subtitle: 'Отказаться', color: '#6b7280', bgColor: '#f9fafb', icon: '🗑️' },
];

const EisenhowerMatrix: React.FC = () => {
  const { nodes, eisenhowerTasks, selectedNodeId } = useMindMapStore();
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant>('A');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const task: EisenhowerTask = {
      id: uuidv4(),
      text: newTaskText.trim(),
      quadrant: selectedQuadrant,
      done: false,
      createdAt: new Date().toISOString(),
      nodeId: selectedNodeId || undefined,
      dueDate: newTaskDate || undefined,
      dueTime: newTaskTime || undefined,
    };
    useMindMapStore.getState().addEisenhowerTask(task);
    setNewTaskText('');
    setNewTaskDate('');
    setNewTaskTime('');
  };

  const getNodeName = (nodeId?: string) => {
    if (!nodeId) return null;
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.text : null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📊 Матрица Эйзенхауэра</h2>
            <p className="text-sm text-gray-500 mt-1">Управляйте задачами по приоритету</p>
          </div>
          <button onClick={() => useMindMapStore.setState({ showEisenhowerMatrix: false })} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2 mb-2">
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
                <option key={q.id} value={q.id}>{q.icon} {q.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={handleAddTask} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">➕ Добавить</button>
          </div>
          {selectedNodeId && (
            <p className="text-xs text-gray-500 mt-2">📌 Привязано к узлу: <strong>{getNodeName(selectedNodeId)}</strong></p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {QUADRANT_CONFIG.map(config => {
              const tasks = eisenhowerTasks.filter(t => t.quadrant === config.id);
              return (
                <div key={config.id} className="rounded-xl border-2 p-4" style={{ backgroundColor: config.bgColor, borderColor: config.color + '40' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: config.color }}>{config.title}</h3>
                      <p className="text-xs text-gray-600">{config.subtitle}</p>
                    </div>
                    <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: config.color, color: 'white' }}>
                      {tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">Нет задач</p>
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className={`bg-white rounded-lg p-2 border ${task.done ? 'opacity-50' : ''}`} style={{ borderColor: config.color + '40' }}>
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => useMindMapStore.getState().updateEisenhowerTask(task.id, { done: !task.done })}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <p className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</p>
                              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>}
                                {task.dueTime && <span>🕐 {task.dueTime}</span>}
                              </div>
                              {task.nodeId && <p className="text-xs text-gray-400 mt-1">📌 {getNodeName(task.nodeId)}</p>}
                            </div>
                            <div className="flex gap-1">
                              <select
                                value={task.quadrant}
                                onChange={(e) => useMindMapStore.getState().updateEisenhowerTask(task.id, { quadrant: e.target.value as EisenhowerQuadrant })}
                                className="text-xs border border-gray-200 rounded px-1"
                              >
                                {QUADRANT_CONFIG.map(q => <option key={q.id} value={q.id}>{q.icon}</option>)}
                              </select>
                              <button onClick={() => useMindMapStore.getState().deleteEisenhowerTask(task.id)} className="text-red-400 text-xs">🗑️</button>
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
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
