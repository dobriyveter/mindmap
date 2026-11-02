import React, { useState } from 'react';
import useMindMapStore from '../store/mindmapStore';
import { EisenhowerTask } from '../types';

const Calendar: React.FC = () => {
  const { eisenhowerTasks, updateEisenhowerTask, getTasksByDate, getUpcomingTasks, getOverdueTasks } = useMindMapStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'list'>('calendar');

  // Генерация дней для текущего месяца
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Пустые дни до начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const tasks = getTasksByDate(dateStr);
      days.push({
        date: i,
        dateStr,
        tasks,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      });
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const upcomingTasks = getUpcomingTasks(7);
  const overdueTasks = getOverdueTasks();

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'A': return '#dc2626';
      case 'B': return '#ea580c';
      case 'C': return '#2563eb';
      case 'D': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleTaskToggle = (taskId: string) => {
    const task = eisenhowerTasks.find(t => t.id === taskId);
    if (task) {
      updateEisenhowerTask(taskId, { done: !task.done });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📅 Календарь задач</h2>
            <p className="text-sm text-gray-500 mt-1">Планирование и управление временем</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => useMindMapStore.setState({ showCalendar: false })}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
            >
              ×
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              📅 Календарь
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              📊 Временная шкала
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              📋 Список
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border p-4">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      ←
                    </button>
                    <h3 className="text-lg font-semibold">
                      {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      →
                    </button>
                  </div>

                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => (
                      <div
                        key={idx}
                        onClick={() => day && setSelectedDate(day.dateStr)}
                        className={`
                          min-h-[80px] p-1 border rounded cursor-pointer transition-all
                          ${!day ? 'border-transparent' : 'border-gray-200 hover:border-blue-400'}
                          ${day?.isToday ? 'bg-blue-50 border-blue-400' : ''}
                          ${selectedDate === day?.dateStr ? 'bg-blue-100 border-blue-500' : ''}
                        `}
                      >
                        {day && (
                          <>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {day.date}
                            </div>
                            <div className="space-y-0.5">
                              {day.tasks.slice(0, 3).map(task => (
                                <div
                                  key={task.id}
                                  className="text-xs px-1 py-0.5 rounded truncate"
                                  style={{
                                    backgroundColor: getQuadrantColor(task.quadrant) + '20',
                                    color: getQuadrantColor(task.quadrant),
                                  }}
                                  title={task.text}
                                >
                                  {task.text}
                                </div>
                              ))}
                              {day.tasks.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{day.tasks.length - 3} ещё
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected date tasks */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                      : 'Выберите день'}
                  </h3>
                  
                  {selectedDate ? (
                    <div className="space-y-2">
                      {getTasksByDate(selectedDate).length === 0 ? (
                        <p className="text-sm text-gray-500">Нет задач на этот день</p>
                      ) : (
                        getTasksByDate(selectedDate).map(task => (
                          <div
                            key={task.id}
                            className="p-2 border rounded hover:bg-gray-50"
                            style={{ borderLeftColor: getQuadrantColor(task.quadrant), borderLeftWidth: '3px' }}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleTaskToggle(task.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {task.text}
                                </p>
                                {task.dueTime && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    🕐 {formatTime(task.dueTime)}
                                  </p>
                                )}
                                {task.timeEstimate && (
                                  <p className="text-xs text-gray-500">
                                    ⏱️ {task.timeEstimate} мин
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Кликните на день в календаре</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Предстоящие задачи (7 дней)</h3>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-500">Нет предстоящих задач</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map(task => {
                    const taskDate = new Date(task.dueDate!);
                    const isToday = taskDate.toDateString() === new Date().toDateString();
                    const isTomorrow = taskDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        style={{ borderLeftColor: getQuadrantColor(task.quadrant), borderLeftWidth: '4px' }}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.text}
                          </p>
                          <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span>
                              📅 {isToday ? 'Сегодня' : isTomorrow ? 'Завтра' : taskDate.toLocaleDateString('ru-RU')}
                            </span>
                            {task.dueTime && <span>🕐 {formatTime(task.dueTime)}</span>}
                            {task.timeEstimate && <span>⏱️ {task.timeEstimate} мин</span>}
                          </div>
                        </div>
                        <div
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: getQuadrantColor(task.quadrant) + '20',
                            color: getQuadrantColor(task.quadrant),
                          }}
                        >
                          {task.quadrant}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-5">
              {/* Overdue tasks */}
              {overdueTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    ⚠️ Просроченные задачи ({overdueTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {overdueTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 border-2 border-red-300 bg-red-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-red-700'}`}>
                            {task.text}
                          </p>
                          <div className="flex gap-3 text-xs text-red-600 mt-1">
                            <span>📅 {new Date(task.dueDate!).toLocaleDateString('ru-RU')}</span>
                            {task.dueTime && <span>🕐 {formatTime(task.dueTime)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All tasks with dates */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Все задачи с датами ({eisenhowerTasks.filter(t => t.dueDate).length})
                </h3>
                <div className="space-y-2">
                  {eisenhowerTasks
                    .filter(t => t.dueDate)
                    .sort((a, b) => {
                      if (!a.dueDate) return 1;
                      if (!b.dueDate) return -1;
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    })
                    .map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        style={{ borderLeftColor: getQuadrantColor(task.quadrant), borderLeftWidth: '3px' }}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.text}
                          </p>
                          <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span>📅 {new Date(task.dueDate!).toLocaleDateString('ru-RU')}</span>
                            {task.dueTime && <span>🕐 {formatTime(task.dueTime)}</span>}
                            {task.timeEstimate && <span>⏱️ {task.timeEstimate} мин</span>}
                          </div>
                        </div>
                        <div
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: getQuadrantColor(task.quadrant) + '20',
                            color: getQuadrantColor(task.quadrant),
                          }}
                        >
                          {task.quadrant}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
