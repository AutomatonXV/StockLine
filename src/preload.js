const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('stockline', {
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body })
});
