import React, { useState, useEffect } from 'react';
import { useMindMapStore } from '../store/mindmapStore';

interface Props {
  onSelectProject: (projectId: string) => void;
  onCreateNew: () => void;
}

const ProjectList: React.FC<Props> = ({ onSelectProject, onCreateNew }) => {
  const { projects, loadProjects, deleteProject } = useMindMapStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">🧠 MindFlow</h1>
          <p className="text-lg text-gray-600">Ваши проекты ментальных карт</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={onCreateNew} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg">
            <span className="text-2xl">➕</span>
            <span className="ml-2 text-lg">Новый проект</span>
          </button>
        </div>

        {projects.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Поиск проектов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'Проекты не найдены' : 'Пока нет проектов'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте свой первый проект!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1">{project.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (deleteConfirmId === project.id) {
                          deleteProject(project.id);
                          setDeleteConfirmId(null);
                        } else {
                          setDeleteConfirmId(project.id);
                          setTimeout(() => setDeleteConfirmId(null), 3000);
                        }
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >{deleteConfirmId === project.id ? '⚠️' : '🗑️'}</button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      <span>{project.data.nodes.length} узлов</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🔗</span>
                      <span>{project.data.connections.length} связей</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕒</span>
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <p className="text-xs text-gray-500">Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Всего проектов: {projects.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
