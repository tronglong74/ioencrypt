const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  generateKey: (payload) => ipcRenderer.invoke('generate-key', payload),
  encryptFiles: (payload) => ipcRenderer.invoke('encrypt-files', payload),
  decryptFiles: (payload) => ipcRenderer.invoke('decrypt-files', payload),
});
