const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = !app.isPackaged;

app.commandLine.appendSwitch('lang', 'en-US');
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'MindFlow',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      dialog.showErrorBox('Error', `Failed to load application:\n${err.message}`);
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('obsidian://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

const template = [
  {
    label: 'File',
    submenu: [
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu-action', 'save') },
      { type: 'separator' },
      { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.webContents.reload() },
      { label: 'Full Screen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { role: 'resetZoom' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About MindFlow',
            message: 'MindFlow',
            detail: `Version: ${app.getVersion()}\n\nMind mapping application.`,
          });
        }
      }
    ]
  }
];

app.whenReady().then(() => {
  createWindow();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Obsidian IPC handlers
ipcMain.handle('obsidian:check-vault', async (event, vaultPath) => {
  try {
    const stats = await fs.stat(vaultPath);
    return { exists: stats.isDirectory(), path: vaultPath };
  } catch (error) {
    return { exists: false, error: error.message };
  }
});

ipcMain.handle('obsidian:list-notes', async (event, vaultPath) => {
  try {
    const notes = [];
    async function scanDir(dir, relativePath = '') {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '.obsidian' || entry.name === '.trash') continue;
          await scanDir(fullPath, relPath);
        } else if (entry.name.endsWith('.md')) {
          const stats = await fs.stat(fullPath);
          notes.push({
            path: relPath.replace(/\\/g, '/'),
            name: entry.name.replace('.md', ''),
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        }
      }
    }
    await scanDir(vaultPath);
    return { success: true, notes, count: notes.length };
  } catch (error) {
    return { success: false, error: error.message, notes: [] };
  }
});

ipcMain.handle('obsidian:search-notes', async (event, vaultPath, query) => {
  try {
    const results = [];
    const queryLower = query.toLowerCase();
    async function searchInDir(dir, relativePath = '') {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '.obsidian' || entry.name === '.trash') continue;
          await searchInDir(fullPath, relPath);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          if (content.toLowerCase().includes(queryLower) || entry.name.toLowerCase().includes(queryLower)) {
            results.push({ path: relPath.replace(/\\/g, '/'), name: entry.name.replace('.md', '') });
          }
        }
      }
    }
    await searchInDir(vaultPath);
    return { success: true, results, count: results.length };
  } catch (error) {
    return { success: false, error: error.message, results: [] };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
