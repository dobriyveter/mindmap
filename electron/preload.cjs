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
  
  // Работа с файлами Obsidian
  obsidian: {
    // Проверить существует ли папка vault
    checkVault: (vaultPath) => ipcRenderer.invoke('obsidian:check-vault', vaultPath),
    
    // Получить список всех заметок
    listNotes: (vaultPath) => ipcRenderer.invoke('obsidian:list-notes', vaultPath),
    
    // Прочитать содержимое заметки
    readNote: (vaultPath, notePath) => ipcRenderer.invoke('obsidian:read-note', vaultPath, notePath),
    
    // Поиск по заметкам
    searchNotes: (vaultPath, query) => ipcRenderer.invoke('obsidian:search-notes', vaultPath, query),
    
    // Создать/обновить заметку
    writeNote: (vaultPath, notePath, content) => ipcRenderer.invoke('obsidian:write-note', vaultPath, notePath, content),
  },
  
  // Информация о платформе
  platform: process.platform,
  isPackaged: process.env.NODE_ENV === 'production',
});
