const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  alwaysOnTop: (value) => ipcRenderer.invoke('window:alwaysOnTop', value),
  notify: (options) => ipcRenderer.invoke('notify', options),
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
  getTimeContext: () => ipcRenderer.invoke('getTimeContext'),

  // Store operations
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store:delete', key),
});