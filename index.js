const { app, ipcMain, globalShortcut, clipboard, screen, shell , BrowserWindow } = require('electron');
const { BrowserWindow: AcrylicBrowserWindow } = require('electron');
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const robot = require('robotjs');
const os = require('os');
const fs = require('fs');
const { spawn, exec } = require('child_process');
let mainWindow = null , menuWindow = null , inputWindow = null , messageWindow = null;
const { askAI } = require('./js-files/aiRequest');
const { analyzeScreen: observeScreen, setMainWindow } = require('./js-files/screenObserver');
const { analyzeScreen: roastScreen } = require('./js-files/mainRoaster');
const { analyzeSentiment } = require('./js-files/sentimentAnalyzer');
const { startAppWatcher } = require('./js-files/appWatcher');
const { runYouTubeSummary } = require('./js-files/youtubeSummarizer');
const { saveCodeToDesktop } = require('./js-files/fileGenerator');
const { remember, recall, logChat } = require('./memoryManager');
const systemInstructions = require('./js-files/systemInstructions');
let glowWindow = null;
const systemPrompt = fs.readFileSync(path.join(__dirname, './system_prompt.txt'), 'utf8');
const memoryPath = path.join(__dirname, 'memory.json');
const activeWindow = require('active-win');
const { config } = require('process');

let isOllamaProcessing = false;

let userSettings = {
  aiMode: "manual",
  enableRoasting: true,
  enableYouTubeSummary: true,
  enableEyeTracking: true,
  enableHandGestures: true,
  replyLang: "en-IN",     // NOTE: use language codes for consistency
  voiceLang: "en-IN",
  voiceSpeed: 1.0
};


let globalSettings = {
  replyLang: 'en',
  voiceLang: 'en-IN',
  voiceSpeed: 1.0
};
// ─── Main Eyes ─────────────────────────────────────────────────────────

function createMenuWindow() {
  menuWindow = new BrowserWindow({
    width: 390,
    height: 300,
    resizable: false,
    fullscreenable: false,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "./js-files/preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  menuWindow.loadFile("menu.html");

  menuWindow.on("closed", () => {
    menuWindow = null; // <== Clean up
  });
}

// ─── Main Overlay ─────────────────────────────────────────────────────────
function createMainWindow() {
  closeAllWindowsExcept(null);
  const { width } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
    width: 1500,
    height: 1300,
    x: (width - 1500) / 2,
    y: -158,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.loadFile('index.html');

  globalShortcut.register('Control+Shift+N', () => {
    mainWindow.webContents.send('shortcut-wink');
  });
  setMainWindow(mainWindow);


    mainWindow.on('closed', () => {
      mainWindow = null;
    });
}

// ─── Input Popup ─────────────────────────────────────────────────────────

function openAIInputWindow() {
  closeAllWindowsExcept(null);
  if (inputWindow) return inputWindow.focus();

  const { width } = screen.getPrimaryDisplay().workAreaSize;

  inputWindow = new AcrylicBrowserWindow({
    width: 600,
    height: 400,
    x: (width - 600) / 2,
    y: 100,
    frame: false,
    transparent: true, // Needed for CSS blur to work
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
    inputWindow.loadFile('ai_input.html');

    inputWindow.on('closed', () => {
      inputWindow = null;
    });
  }


// ─── Message Popup ────────────────────────────────────────────────────────
function showMessageWindow(msg) {
  closeAllWindowsExcept(null);
  if (messageWindow) messageWindow.close();
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  messageWindow = new AcrylicBrowserWindow({

    x:(1920 / 2) / 1.5,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  messageWindow.loadFile(path.join(__dirname, 'messagewin.html'));
  messageWindow.once('ready-to-show', () => {
    if (!messageWindow.isDestroyed()) {
      messageWindow.showInactive();
      messageWindow.webContents.send('display-message', msg);
    }
  });

  messageWindow.on('closed', () => {
    messageWindow = null;
  });

}
// ─── glow window ───────────────────────────────────────────────────────
ipcMain.on('show-glow-window', () => {
  if (glowWindow) {
    glowWindow.focus();
    return;
  }

  glowWindow = new BrowserWindow({
    width: 600,
    height: 150,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    x: Math.floor((1900 - 600) / 2), // Adjust if needed
    y: -50,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  glowWindow.loadFile('glow.html');

  glowWindow.on('closed', () => {
    glowWindow = null;
  });

  setTimeout(() => {
  if (glowWindow) glowWindow.close();
}, 9000);

});

// ─── functions ───────────────────────────────────────────────────────
function startErrorWatcher() {
  const py = spawn('python', ['path/to/error_watcher.py']);

  py.stdout.on('data', (data) => {
    const json = JSON.parse(data.toString());
    console.log("Error Detected:", json);

    // Trigger assistant or overlay to help
    mainWindow.webContents.send('error-detected', json);
  });

  py.stderr.on('data', (data) => {
    console.error("Error watcher failed:", data.toString());
  });
}

function downloadSubs(url, callback) {
  const cmd = `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "ytvideo.%(ext)s" ${url}`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Subtitle extraction failed: ${stderr}`);
      return;
    }
    console.log("✅ Subtitles downloaded");
    callback('ytvideo.en.vtt');
  });
}

function normalizeYouTubeURL(input) {
  // Handle youtu.be short links
  if (input.includes("youtu.be/")) {
    const id = input.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return input;
}

function closeAllWindowsExcept(except = null) {
  if (inputWindow && inputWindow !== except && !inputWindow.isDestroyed()) {
    inputWindow.close();
  }
  if (messageWindow && messageWindow !== except && !messageWindow.isDestroyed()) {
    messageWindow.close();
  }
  if (menuWindow && menuWindow !== except && !menuWindow.isDestroyed()) {
    menuWindow.close();
  }
}

ipcMain.handle('ask-ollama', async (event, prompt) => {
  const win = BrowserWindow.getFocusedWindow();

  // Show loading message in renderer
  win.webContents.send('display-message', '🧠 Thinking...', { voiceLang: 'en-IN' });

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false
      })
    });

    const json = await res.json();
    const output = json.response || 'No response.';

    // Show actual response now
    win.webContents.send('display-message', output, { voiceLang: 'en-IN' });

  } catch (err) {
    console.error(err);
    win.webContents.send('display-message', '⚠️ Error from Ollama.', { voiceLang: 'en-IN' });
  }
});
// MAIN PROCESS (in Electron)
ipcMain.on("settings-updated", (event, newSettings) => {
  messageWindow.webContents.send("update-settings", newSettings);
});





// ─── Fire Commands ───────────────────────────────────────────────────────
// ipcMain.handle('ask-ai', async (_, userInput) => {
//   try {
//     // Attach the system instructions
//     const finalPrompt = `${systemPrompt}\n\nUser: ${userInput}\nAssistant:`;

//     // Ask your AI using the full prompt
//     const res = await askAI(finalPrompt);

//     console.log("[📢 askAI response]:", res);
//     showMessageWindow(res || "🤷‍♂️ AI had nothing to say.");
//     return res;
//   } catch (err) {
//     console.error("[❌ askAI failed]:", err.message);
//     showMessageWindow("🧨 AI exploded. Check your server.");
//     return "AI error.";
//   }
// });


ipcMain.handle('analyze-screen', async () => {
  try {
    const userInput = await analyzeScreen(mainWindow);
    const finalPrompt = `${systemInstructions}\n\nUser: ${userInput}\nAssistant:`;
    const response = await askAI(finalPrompt);
    showMessageWindow(response);
    return roastText;
  } catch (err) {
    console.error("[❌ analyze-screen] Error:", err.message);
    showMessageWindow("⚠️ Couldn't analyze screen.");
    return "Error";
  }
});
// to take screenshot

ipcMain.on('insert-text', (_, t) => {
  clipboard.writeText(t);
  robot.keyTap('v', 'control');
}); // to use robot to press keys 

ipcMain.on('request-eye-position', (e) => {
  e.sender.send('position-under-eyes', mainWindow.getBounds());
}); // to get the correct position below the eyes for messages

ipcMain.on('allow-mouse-events', () => {
  mainWindow.setIgnoreMouseEvents(false); // temporarily allow all events
}); //to allow mouse to be used in overlay messages

ipcMain.on('ignore-mouse-events', () => {
  mainWindow.setIgnoreMouseEvents(true, { forward: true }); // back to transparent mode
}); // to ignor mouse outside any component

ipcMain.on('show-sentiment-message', (event, message) => {
  showMessageWindow(message); // This stays globally active, always listening
});
ipcMain.on('menuwin' , () => {
  createMenuWindow();
});


ipcMain.on('allow-mouse-events', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.setIgnoreMouseEvents(false);
});

ipcMain.on('ignore-mouse-events', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.setIgnoreMouseEvents(true, { forward: true });
});

ipcMain.handle('ask-ai', async (_, userInput) => {
  try {
    const finalPrompt = `${systemPrompt}\n\nUser: ${userInput}\nAssistant:`;
    const response = await askAI(finalPrompt);
    console.log("[📢 askAI response]:", response);

    const codeMatch = response.match(/```(.*?)\n([\s\S]*?)```/);
    
    // === Create a file ===
    if (userInput.toLowerCase().includes('create a file') && codeMatch) {
      const language = codeMatch[1].trim();
      const code = codeMatch[2].trim();
      const filePath = saveCodeToDesktop(code, language, `Generated ${language} Code`);
      console.log("📁 Saving to:", filePath);
      showMessageWindow(`📄 Code saved to Desktop as ${path.basename(filePath)}`);
      shell.openPath(filePath);

      // Optional paste
      setTimeout(() => {
        robot.keyTap('v', ['control']);
      }, 1000);
    }

    // === Paste a code ===
    if (userInput.toLowerCase().includes('paste a code') && codeMatch) {
      const language = codeMatch[1].trim();
      const code = codeMatch[2].trim();
      const filePath = saveCodeToDesktop(code, language, `Generated ${language} Code`);
      clipboard.writeText(code);
      showMessageWindow(`📄 Code copied to clipboard and saved as ${path.basename(filePath)}.\nI'll paste it in 3 seconds — focus your code editor now!`);
      shell.openPath(filePath);
      
      setTimeout(() => {
        try {
          robot.keyTap('v', ['control']);
        } catch (err) {
          showMessageWindow("⚠️ Auto-paste failed. Just press Ctrl+V yourself!");
        }
      }, 3000);
    }
    // === If no code found ===
    if (!codeMatch && (userInput.toLowerCase().includes('create a file') || userInput.toLowerCase().includes('paste a code'))) {
      showMessageWindow("⚠️ No valid code block found.");
    }

    return response;
  } catch (err) {
    console.error("[❌ askAI failed]:", err.message);
    showMessageWindow("🧨 AI exploded. Check your server.");
    return "AI error.";
  }
});


ipcMain.on('yt-summary-choice', (event, choice) => {
  if (choice === 'full') {
    showMessageWindow("📝 Full summary selected!");
    // Do something with the full summary
  } else if (choice === 'short') {
    showMessageWindow("📌 Short summary selected!");
    // Do something with the short summary
  }
});


// Receive settings from renderer
ipcMain.on('save-settings', (event, settings) => {
  console.log("🛠️ Settings received in main:", settings);
  // You can store or send to another window from here
});





ipcMain.on("close-menu-window", () => {
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.close(); // This triggers the `.on("closed")` cleanup
  }
});

ipcMain.on("sendSettings", (event, settings) => {
  if (messageWindow && !messageWindow.isDestroyed()) {
    messageWindow.webContents.send("update-settings", settings);
  }
});






// ─── Initialization ─────────────────s──────────────────────────────────────

app.whenReady().then(() => {
  createMenuWindow();
  startAppWatcher();
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu-compositing');


  
  
  // if (fs.existsSync(memoryPath)) {
  //   const data = fs.readFileSync(memoryPath);
  //   initializeMemory(JSON.parse(data));
  // }

setInterval(() => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const pos = robot.getMousePos();
    mainWindow.webContents.send('global-mouse', pos);
    mainWindow.webContents.send('cursor-position', screen.getCursorScreenPoint());
  }
}, 60);



// Register the global shortcut
globalShortcut.register('Control+Alt+C', async () => {
  try {
    const selectedText = clipboard.readText().trim();

    if (selectedText.length > 0 && mainWindow) {
      const result = await analyzeSentiment(selectedText); // Must be defined & imported
      showMessageWindow(result);
      mainWindow.webContents.send("show-message", result);
    }
  } catch (err) {
    console.error("❌ Error in global shortcut handler:", err);
  }
});


  
  setInterval(async () => {
    if (Math.random() < 0.2) { // 20% chance
      console.log("[🧠] Attempting roast screen analysis...");

      try {
        const screenSummary = await observeScreen();

        // Add brutal roast prompt with Ollama
        const roastPrompt = `${screenSummary}`;

        const roast = await analyzeSentiment(roastPrompt);

        if (roast && roast.trim()) {
          mainWindow.webContents.send("show-message",roast.trim());
          showMessageWindow(roast.trim());
        }
      } catch (err) {
        console.error("[😵‍💫] Screen roast failed:", err.message);
      }
    }
  }, 2 * 60 * 1000); // Every 2 minutes

  

ipcMain.on("start-ai", (event, settings) => {
  createMainWindow();
  userSettings = { ...userSettings , ...config};
  console.log("✅ User Settings Applied:", userSettings);

  // Optionally: send to renderer
  for (const messageWindow of BrowserWindow.getAllWindows()) {
    messageWindow.webContents.send("update-settings", userSettings);
  }
});


  // Hotkeys
  const reg = (k, cb) => {
    if (!globalShortcut.register(k, cb)) console.error(`Failed to register ⌨️ ${k}`);
  };
  reg('Control+Space', openAIInputWindow);
  reg('Control+Shift+Space', () => inputWindow?.close());
  
  reg('Control+Shift+R', async () => {
    try {
            const screenSummary = await observeScreen();

            // Add brutal roast prompt with Ollama
            const roastPrompt = `${screenSummary}`;

            const roast = await analyzeSentiment(roastPrompt);

            if (roast && roast.trim()) {
              mainWindow.webContents.send("show-message",roast.trim());
              showMessageWindow(roast.trim());
            }
          } catch (err) {
            console.error("[😵‍💫] Screen roast failed:", err.message);
          }
  });
    reg('Control+Alt+F', openAIInputWindow);


  globalShortcut.register('Control+Shift+Y', async () => {
    let url = clipboard.readText().trim();
    console.log("📋 Copied URL:", url);

    url = normalizeYouTubeURL(url);
    console.log("🔗 Normalized URL:", url);

    try {
      const { full, short } = await runYouTubeSummary(url);

      // Send both summaries to the frontend
      mainWindow.webContents.send("yt-summary-options", { full, short });

      showMessageWindow("📺 Summary ready. Press 'F' for full or 'S' for short.");
    } catch (err) {
      console.error("❌ Summary failed:", err);
      showMessageWindow("❌ Failed to get summary. Try again.");
    }
  });

  




  reg('Control+Alt+R', async () => {
    const { detectedText } = await observeScreen(mainWindow);
    showMessageWindow(await askAI(`sarcastic roast: "${detectedText}"`));
  });

  reg('Control+Shift+Z', async () => {
    showMessageWindow('Seems the code works flawlessly')
  });
  reg('Control+Shift+I', () => messageWindow?.webContents.openDevTools({ mode: 'detach' }));
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMenuWindow();
  });

// Quit if all windows closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
