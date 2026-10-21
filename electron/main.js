import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

// Performance optimizations for Electron
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-print-preview');

function createWindow() {
  const possibleIconPath = isDev 
    ? path.join(__dirname, '../public/icone.png')
    : path.join(__dirname, '../dist/icone.png');
  const iconPath = fs.existsSync(possibleIconPath) ? possibleIconPath : undefined;

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: 'Dashboard',
    icon: iconPath,
    backgroundColor: '#BFDBFE',
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#BFDBFE',
      symbolColor: '#1e293b',
      height: 38
    } : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // In development, load the Vite dev server
    win.loadURL('http://localhost:3000');
    // win.webContents.openDevTools(); // Uncomment to open DevTools by default
  } else {
    // In production, load the built static files
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.on('set-title-bar-color', (event, color, symbolColor) => {
  const webContents = event.sender;
  const window = BrowserWindow.fromWebContents(webContents);
  if (window && process.platform === 'win32') {
    window.setTitleBarOverlay({
      color: color,
      symbolColor: symbolColor || '#1e293b'
    });
  }
});

ipcMain.on('print-page', (event) => {
  const webContents = event.sender;
  if (webContents) {
    webContents.print({
      silent: false,
      printBackground: true,
      color: true
    });
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
