const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onForceClose: (callback) => ipcRenderer.on('force-close-box', callback),
});
contextBridge.exposeInMainWorld('api', {
  requestWink: (data) => ipcRenderer.invoke('do-wink', data),
});
contextBridge.exposeInMainWorld('electronAPI', {
  onMessage: (callback) => ipcRenderer.on('display-message', (_, data) => callback(data)),
});

ipcRenderer.on('show-message', (_, msg) => {
  // Use your existing message system here
  document.getElementById('ai-message-box').innerText = msg;
});
contextBridge.exposeInMainWorld('electronAPI', {
  sendSummaryChoice: (choice) => ipcRenderer.send('yt-summary-choice', choice),
});

contextBridge.exposeInMainWorld("electronAPI", {
  onInit: (callback) => ipcRenderer.on("initialize-settings", (event, data) => callback(data))
});

contextBridge.exposeInMainWorld('electronAPI', {
  sendSettings: (settings) => ipcRenderer.send('save-settings', settings)
});

contextBridge.exposeInMainWorld('electronAPI', {
  showMessage: () => ipcRenderer.send("createMenuWindow"),
  allowMouse: () => ipcRenderer.send('allow-mouse-events'),
  ignoreMouse: () => ipcRenderer.send('ignore-mouse-events')
});

document.getElementById('exitBtn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});

contextBridge.exposeInMainWorld("electronAPI", {
  sendSettings: (settings) => ipcRenderer.send("sendSettings", settings),
});
contextBridge.exposeInMainWorld("electronAPI", {
  send: ipcRenderer.send,
  on: ipcRenderer.on,
  invoke: ipcRenderer.invoke,
});