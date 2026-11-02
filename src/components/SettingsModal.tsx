import React, { useState, useEffect } from 'react';
import useMindMapStore from '../store/mindmapStore';
import { checkObsidianConnection, listObsidianNotes } from '../utils/obsidian';

const SettingsModal: React.FC = () => {
  const {
    showSettings, setShowSettings, theme, setTheme,
    obsidianVaultPath, setObsidianVaultPath,
    obsidianApiKey, setObsidianApiKey,
  } = useMindMapStore();

  const [vaultPath, setVaultPath] = useState(obsidianVaultPath);
  const [apiKey, setApiKey] = useState(obsidianApiKey);
  const [obsidianConnected, setObsidianConnected] = useState<boolean | null>(null);
  const [noteCount, setNoteCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'general' | 'obsidian' | 'data'>('general');

  useEffect(() => {
    if (showSettings && activeTab === 'obsidian') {
      checkConnection();
    }
  }, [showSettings, activeTab]);

  const checkConnection = async () => {
    setObsidianConnected(null);
    const connected = await checkObsidianConnection();
    setObsidianConnected(connected);
    if (connected) {
      const notes = await listObsidianNotes();
      setNoteCount(notes.length);
    }
  };

  if (!showSettings) return null;

  const handleSaveObsidian = () => {
    setObsidianVaultPath(vaultPath);
    setObsidianApiKey(apiKey);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">⚙️ Настройки</h2>
          <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5">
          {[
            { id: 'general' as const, label: '🎨 Общие', },
            { id: 'obsidian' as const, label: '📝 Obsidian', },
            { id: 'data' as const, label: '💾 Данные', },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Тема оформления</h3>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    theme === 'light' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">☀️</div>
                  <div className="text-sm font-medium">Светлая</div>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    theme === 'dark' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🌙</div>
                  <div className="text-sm font-medium">Тёмная</div>
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">⌨️ Горячие клавиши</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Отменить</span>
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Повторить</span>
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+Y</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Дублировать</span>
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+D</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Удалить</span>
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Delete</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Масштаб</span>
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Колёсико</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Новый узел</span>
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Двойной клик</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Obsidian Tab */}
          {activeTab === 'obsidian' && (
            <div>
              {/* Connection Status */}
              <div className={`p-4 rounded-lg mb-4 border ${
                obsidianConnected === null ? 'bg-gray-50 border-gray-200' :
                obsidianConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {obsidianConnected === null ? '⏳' : obsidianConnected ? '✅' : '❌'}
                    </span>
                    <div>
                      <p className="font-medium text-sm">
                        {obsidianConnected === null ? 'Проверка...' :
                         obsidianConnected ? 'Obsidian подключён!' : 'Obsidian не обнаружен'}
                      </p>
                      {obsidianConnected && (
                        <p className="text-xs text-green-600">Найдено заметок: {noteCount}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={checkConnection}
                    className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
                  >
                    🔄 Проверить
                  </button>
                </div>
              </div>

              {/* How to setup */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">📋 Как настроить интеграцию:</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-medium text-sm text-blue-800">Установите плагин в Obsidian</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Откройте Obsidian → Настройки → Сторонние плагины → Обзор → 
                        найдите <strong>"Local REST API"</strong> → Установить → Включить
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-medium text-sm text-blue-800">Настройте плагин</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        В настройках плагина:
                      </p>
                      <ul className="text-xs text-blue-600 mt-1 ml-3 list-disc">
                        <li>Отключите <strong>"Enable HTTPS"</strong> (используем HTTP)</li>
                        <li>Скопируйте <strong>API Key</strong></li>
                        <li>Убедитесь что порт — <strong>27124</strong></li>
                        <li>Плагин должен быть активен (зелёный индикатор)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-medium text-sm text-blue-800">Укажите путь к хранилищу</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Введите путь к папке вашего Obsidian vault ниже.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <div>
                      <p className="font-medium text-sm text-blue-800">Добавляйте ссылки в узлы</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        После настройки, в боковой панели узла добавляйте названия заметок.
                        Клик по ссылке в узле откроет заметку прямо в Obsidian!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vault path input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Путь к Obsidian Vault
                </label>
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
                  placeholder="C:\Users\Имя\Documents\MyVault"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Пример: C:\Users\Username\Documents\ObsidianVault
                </p>
              </div>

              {/* API Key input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  🔑 API Key (из плагина Local REST API)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                  placeholder="Вставьте API ключ из настроек плагина"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Скопируйте ключ из настроек плагина Local REST API в Obsidian
                </p>
                <button
                  onClick={handleSaveObsidian}
                  className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                >
                  💾 Сохранить настройки
                </button>
              </div>

              {/* Alternative: URI links */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium mb-1">💡 Альтернативный способ (без плагина)</p>
                <p className="text-xs text-amber-700">
                  Даже без плагина Local REST API, ссылки на заметки Obsidian будут работать через 
                  протокол <code className="bg-amber-100 px-1 rounded">obsidian://open?vault=...&file=...</code>. 
                  Просто укажите название заметки — она откроется в Obsidian при клике!
                </p>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">💾 Управление данными</h3>
              
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Автосохранение:</strong> Данные автоматически сохраняются каждые 30 секунд 
                    в localStorage браузера.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Облачная синхронизация:</strong> Экспортируйте карту в JSON и сохраните 
                    в облачное хранилище (Google Drive, Dropbox, OneDrive). Для импорта загрузите файл.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    useMindMapStore.getState().saveToLocal();
                    alert('✅ Данные сохранены!');
                  }}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium"
                >
                  💾 Сохранить сейчас
                </button>
                <button
                  onClick={() => {
                    if (confirm('⚠️ Вы уверены? Все несохранённые данные будут потеряны.')) {
                      localStorage.removeItem('mindflow_map');
                      window.location.reload();
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 font-medium"
                >
                  🗑️ Очистить всё
                </button>
              </div>

              {/* API Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">🔌 Obsidian Local REST API</h4>
                <p className="text-xs text-gray-500 mb-2">
                  Для полной интеграции с Obsidian (чтение/запись заметок) установите плагин:
                </p>
                <a
                  href="https://github.com/coddingtonbear/obsidian-local-rest-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  github.com/coddingtonbear/obsidian-local-rest-api
                </a>
                <p className="text-xs text-gray-400 mt-2">
                  API доступен на <code className="bg-gray-200 px-1 rounded">https://127.0.0.1:27124</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
