const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getRecordingFolderPath: () => ipcRenderer.invoke('getRecordingFolderPath'),
  saveRecordingChunk: (filePath, buffer) => ipcRenderer.invoke('saveRecordingChunk', filePath, buffer),
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});