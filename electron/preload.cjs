const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  obsidian: {
    checkVault: (vaultPath) => ipcRenderer.invoke('obsidian:check-vault', vaultPath),
    listNotes: (vaultPath) => ipcRenderer.invoke('obsidian:list-notes', vaultPath),
    searchNotes: (vaultPath, query) => ipcRenderer.invoke('obsidian:search-notes', vaultPath, query),
    readNote: (vaultPath, notePath) => ipcRenderer.invoke('obsidian:read-note', vaultPath, notePath),
    writeNote: (vaultPath, notePath, content) => ipcRenderer.invoke('obsidian:write-note', vaultPath, notePath, content),
  },
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },
  platform: process.platform,
  isPackaged: process.env.NODE_ENV === 'production',
});
