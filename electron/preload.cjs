const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // You can expose custom functions to the renderer process here
  setTitleBarColor: (color, symbolColor) => ipcRenderer.send('set-title-bar-color', color, symbolColor),
  printPage: () => ipcRenderer.send('print-page')
});
