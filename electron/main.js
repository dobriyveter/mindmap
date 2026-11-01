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
    title: 'MindFlow — Ментальные карты',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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
      label: 'Файл',
      submenu: [
        {
          label: 'Новая карта',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new');
          }
        },
        { type: 'separator' },
        {
          label: 'Сохранить',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-action', 'save');
          }
        },
        {
          label: 'Экспорт в JSON...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-action', 'export');
          }
        },
        {
          label: 'Импорт из JSON...',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-action', 'import');
          }
        },
        { type: 'separator' },
        {
          label: 'Выход',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        {
          label: 'Обновить',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.reload()
        },
        {
          label: 'Полный экран',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
        },
        {
          label: 'Инструменты разработчика',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
        },
        { type: 'separator' },
        { role: 'zoomIn', label: 'Увеличить' },
        { role: 'zoomOut', label: 'Уменьшить' },
        { role: 'resetZoom', label: 'Сбросить масштаб' }
      ]
    },
    {
      label: 'Помощь',
      submenu: [
        {
          label: 'О программе',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'О программе MindFlow',
              message: 'MindFlow',
              detail: `Версия: ${app.getVersion()}\n\nПриложение для создания ментальных карт.\n\nСоздано с помощью Electron + React + TypeScript`,
              icon: path.join(__dirname, 'icon.png')
            });
          }
        },
        {
          label: 'Горячие клавиши',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Горячие клавиши',
              detail: `Двойной клик — новый узел
Tab — дочерний узел
Enter — соседний узел
Delete — удалить узел
Ctrl+Z — отменить
Ctrl+Y — повторить
Ctrl+D — дублировать
Ctrl+клик — выделить несколько
Колёсико — масштаб`,
              icon: path.join(__dirname, 'icon.png')
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Регистрация протокола obsidian://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('mindflow', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('mindflow');
}

// Обработка второго экземпляра приложения
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

// События приложения
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

// IPC обработчики для диалогов
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Сохранить файл',
    defaultPath: options.defaultPath || 'mindmap.json',
    filters: options.filters || [
      { name: 'JSON файлы', extensions: ['json'] },
      { name: 'Все файлы', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Открыть файл',
    filters: options.filters || [
      { name: 'JSON файлы', extensions: ['json'] },
      { name: 'Все файлы', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  return result;
});
