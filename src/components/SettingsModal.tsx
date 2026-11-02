import React, { useState } from 'react';
import { useMindMapStore } from '../store/mindmapStore';

const SettingsModal: React.FC = () => {
  const { showSettings, theme, setTheme, obsidianVaultPath, setObsidianVaultPath, obsidianApiKey, setObsidianApiKey } = useMindMapStore();
  const [vaultPath, setVaultPath] = useState(obsidianVaultPath);
  const [apiKey, setApiKey] = useState(obsidianApiKey);

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">⚙️ Настройки</h2>
          <button onClick={() => useMindMapStore.setState({ showSettings: false })} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Тема</h3>
          <div className="flex gap-3">
            <button onClick={() => setTheme('light')} className={`flex-1 p-3 rounded-lg border-2 ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>☀️ Светлая</button>
            <button onClick={() => setTheme('dark')} className={`flex-1 p-3 rounded-lg border-2 ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>🌙 Тёмная</button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">📝 Интеграция с Obsidian</h3>
          <p className="text-sm text-gray-500 mb-3">Укажите путь к папке Obsidian vault для связи заметок с узлами.</p>
          
          <label className="block text-sm font-medium text-gray-600 mb-1">Путь к Obsidian Vault</label>
          <input
            type="text"
            value={vaultPath}
            onChange={(e) => setVaultPath(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="C:\Users\Имя\Documents\MyVault"
          />
          
          <label className="block text-sm font-medium text-gray-600 mb-1">🔑 API Key (опционально)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="API ключ из плагина Local REST API"
          />
          
          <button
            onClick={() => {
              setObsidianVaultPath(vaultPath);
              setObsidianApiKey(apiKey);
              useMindMapStore.setState({ showSettings: false });
            }}
            className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
          >💾 Сохранить настройки</button>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600"><strong>MindFlow</strong> v1.0.0</p>
          <p className="text-xs text-gray-400">Приложение для создания ментальных карт</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
