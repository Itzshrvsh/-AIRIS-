// appWatcher.js
const activeWin = require('active-win');
const { analyzeAndRoast } = require('./screenObserver'); // you already have this
const { sendRoastToRenderer } = require('./mainRoaster'); // helper to show message in UI
const { askAI } = require('./aiRequest');

let lastApp = "";

async function checkAppLoop() {
  const win = await activeWin();
  if (!win || !win.owner || !win.owner.name) return;

  const appName = win.owner.name.toLowerCase();

  if (appName !== lastApp) {
    lastApp = appName;

    const roast = await askAI(`user have opened ${appName} roast accoding to the app in just 1 line , it must be simply sweet : dont let the user know what are you going to say , say about the app the user opened .`);
    sendRoastToRenderer(`Hmm... ${appName}? ` + roast);

  }
}

function startAppWatcher(interval = 1200000) {
  setInterval(checkAppLoop, interval);
}

module.exports = { startAppWatcher };
