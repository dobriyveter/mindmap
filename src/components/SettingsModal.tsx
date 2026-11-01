import React, { useState } from 'react';
import useMindMapStore from '../store/mindmapStore';

const SettingsModal: React.FC = () => {
  const {
    showSettings, setShowSettings, theme, setTheme,
    obsidianVaultPath, setObsidianVaultPath, mapTitle,
  } = useMindMapStore();

  const [vaultPath, setVaultPath] = useState(obsidianVaultPath);

  if (!showSettings) return null;

  const handleSaveObsidian = () => {
    setObsidianVaultPath(vaultPath);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">⚙️ Настройки</h2>
          <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Тема оформления</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-3 rounded-lg border-2 text-center ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              ☀️ Светлая
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-3 rounded-lg border-2 text-center ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              🌙 Тёмная
            </button>
          </div>
        </div>

        {/* Obsidian Integration */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">📝 Интеграция с Obsidian</h3>
          <p className="text-sm text-gray-500 mb-2">
            Укажите путь к вашему хранилищу Obsidian для связи заметок с узлами карты.
          </p>
          <input
            type="text"
            value={vaultPath}
            onChange={(e) => setVaultPath(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="C:\Users\Имя\Documents\ObsidianVault"
          />
          <p className="text-xs text-gray-400 mt-1">
            Пример: C:\Users\Username\Documents\MyVault
          </p>
          <button
            onClick={handleSaveObsidian}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
          >
            Сохранить путь
          </button>
        </div>

        {/* API Info */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">🔌 API и облачная синхронизация</h3>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Obsidian Local REST API</strong><br />
              Для интеграции с Obsidian установите плагин 
              <a href="https://github.com/coddingtonbear/obsidian-local-rest-api" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 underline ml-1">
                Local REST API
              </a> в Obsidian.
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              После установки плагин будет доступен на порту 27124 (HTTPS).
              Убедитесь, что Obsidian запущен при использовании интеграции.
            </p>
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">☁️ Облачная синхронизация</h3>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Данные сохраняются локально в браузере. Для облачной синхронизации 
              используйте экспорт/импорт JSON файлов или настройте синхронизацию 
              через облачное хранилище (Google Drive, Dropbox).
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">💾 Управление данными</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                useMindMapStore.getState().saveToLocal();
                alert('Данные сохранены!');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              💾 Сохранить сейчас
            </button>
            <button
              onClick={() => {
                if (confirm('Вы уверены? Все несохранённые данные будут потеряны.')) {
                  localStorage.removeItem('mindflow_map');
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
            >
              🗑️ Очистить данные
            </button>
          </div>
        </div>

        {/* About */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>MindFlow</strong> v1.0<br />
            <span className="text-xs">Приложение для создания ментальных карт</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
