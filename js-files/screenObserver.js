const screenshot = require('screenshot-desktop');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // npm i sharp

const TEMP_PATH = path.join(__dirname, 'temp_screen.png');

async function analyzeScreen() {
  try {
    const imgBuffer = await screenshot({ format: 'png' });

    const processed = await sharp(imgBuffer)
      .grayscale()
      .sharpen()
      .resize(1920) // Optional: upscale if blurry
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(
      processed,
      'eng',
      { logger: m => console.log(m) }
    );

    if (!text.trim()) return "😶 I couldn’t read anything on the screen.";

    return `🖼️ I see something on your screen:\n\n"${text.trim().slice(0, 500)}"`;

  } catch (err) {
    console.error("❌ Screenshot failed:", err);
    return "❌ I couldn't capture the screen. Check permissions or setup.";
  }
}
function setMainWindow(mainWindow) {
  global.mainWindow = mainWindow;
}

module.exports = {
  analyzeScreen,
  setMainWindow
};
