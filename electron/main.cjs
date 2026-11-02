const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Решаем проблему ICU data
app.commandLine.appendSwitch('lang', 'en-US');

// Отключаем аппаратное ускорение для стабильности на всех ПК
app.disableHardwareAcceleration();

// Устанавливаем правильную рабочую директорию
if (isDev) {
  app.setPath('userData', path.join(app.getPath('appData'), 'MindFlow-dev'));
}

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

  // Показываем окно когда готово (избегаем белого экрана)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Загрузка приложения
  if (isDev) {
    // В режиме разработки — открываем dev-сервер
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools();
  } else {
    // В продакшене — загружаем собранные файлы
    // Electron-builder упаковывает файлы в resources/app/dist/
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('Loading index from:', indexPath);
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      dialog.showErrorBox('Error', `Failed to load application:\n${err.message}\n\nPath: ${indexPath}`);
    });
  }

  // Внешние ссылки открываются в браузере
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Обработка obsidian:// протокола
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('obsidian://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Создание меню приложения
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Map',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new');
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-action', 'save');
          }
        },
        {
          label: 'Export to JSON...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-action', 'export');
          }
        },
        {
          label: 'Import from JSON...',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-action', 'import');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.reload()
        },
        {
          label: 'Full Screen',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
        },
        {
          label: 'Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
        },
        { type: 'separator' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { role: 'resetZoom', label: 'Reset Zoom' }
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
              detail: `Version: ${app.getVersion()}\n\nMind mapping application.\n\nBuilt with Electron + React + TypeScript`,
            });
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Keyboard Shortcuts',
              detail: `Double click - new node
Tab - child node
Enter - sibling node
Delete - remove node
Ctrl+Z - undo
Ctrl+Y - redo
Ctrl+D - duplicate
Ctrl+click - select multiple
Mouse wheel - zoom`,
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Registration of obsidian:// protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('mindflow', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('mindflow');
}

// Handle second instance of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// App events
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for dialogs
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Save file',
    defaultPath: options.defaultPath || 'mindmap.json',
    filters: options.filters || [
      { name: 'JSON files', extensions: ['json'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Open file',
    filters: options.filters || [
      { name: 'JSON files', extensions: ['json'] },
      { name: 'All files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  return result;
});
