const { contextBridge, ipcRenderer } = require('electron');

// Безопасный API для рендер-процесса
contextBridge.exposeInMainWorld('electronAPI', {
  // Диалоги сохранения/открытия файлов
  saveFile: (options) => ipcRenderer.invoke('save-file-dialog', options),
  openFile: (options) => ipcRenderer.invoke('open-file-dialog', options),
  
  // Подписка на действия из меню
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },
  
  // Информация о платформе
  platform: process.platform,
  isPackaged: process.env.NODE_ENV === 'production',
  
  // Версия приложения
  getVersion: () => ipcRenderer.invoke('get-version'),
});
