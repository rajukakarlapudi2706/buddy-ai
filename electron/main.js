const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;
let tray;

// ── Window Creation ──────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 700,
    minWidth: 360,
    minHeight: 600,
    frame: false,           // custom titlebar
    transparent: false,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Allow microphone/media requests in Electron
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      return callback(true);
    }
    callback(false);
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });

  // Allow YouTube embeds
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.anthropic.com https://www.youtube-nocookie.com https://www.youtube.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.elevenlabs.io data: blob:;"
        ]
      }
    });
  });
}

// ── System Tray ──────────────────────────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../public/tray-icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const menu = Menu.buildFromTemplate([
    { label: '👋 Open Buddy', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: '⚙️ Settings', click: () => mainWindow?.webContents.send('open-settings') },
    { type: 'separator' },
    { label: '🚪 Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Buddy — Your Pal is here!');
  tray.setContextMenu(menu);
  tray.on('click', () => {
    if (mainWindow?.isVisible()) mainWindow.focus();
    else mainWindow?.show();
  });
}

// ── IPC Handlers ─────────────────────────────────────────────────────────────

// Store operations
ipcMain.handle('store:get', (_, key) => store.get(key));
ipcMain.handle('store:set', (_, key, value) => { store.set(key, value); return true; });
ipcMain.handle('store:delete', (_, key) => { store.delete(key); return true; });

// Window controls
ipcMain.handle('window:minimize', () => { mainWindow?.minimize(); return true; });
ipcMain.handle('window:close', () => { mainWindow?.hide(); return true; });
ipcMain.handle('window:alwaysOnTop', (_, val) => { mainWindow?.setAlwaysOnTop(val); return true; });

// Notifications
ipcMain.handle('notify', (_, { title, body }) => {
  new Notification({ title, body, icon: path.join(__dirname, '../public/icon.png') }).show();
});

// Open external URLs safely
ipcMain.handle('openExternal', (_, url) => {
  if (url.startsWith('https://')) shell.openExternal(url);
});

// Get system time context
ipcMain.handle('getTimeContext', () => {
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 20) timeOfDay = 'evening';
  else if (hour >= 20) timeOfDay = 'night';
  return {
    hour,
    timeOfDay,
    dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
    date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
  };
});

// ── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
