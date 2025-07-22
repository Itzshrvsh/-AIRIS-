function sendRoastToRenderer(text) {
  if (mainWindow) {
    mainWindow.webContents.send('ai-roast', text);
  }
}

module.exports = { sendRoastToRenderer };
