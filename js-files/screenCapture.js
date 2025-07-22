// screenCapture.js
const { desktopCapturer } = require('electron');

async function captureScreenBuffer() {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  const screen = sources[0];
  const imageBuffer = screen.thumbnail.toPNG(); // Use native Electron
  return imageBuffer;
}

module.exports = { captureScreenBuffer };
