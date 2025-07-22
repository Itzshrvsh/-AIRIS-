# -AIRIS-
AIRIS is a powerful Electron-based desktop application that visually converts source code into abstract syntax trees (AST), allows drag-and-drop code block manipulation, and regenerates source code using LLMs like GPT or Ollama. It supports bidirectional code ↔ visual graph transformation with an intuitive UI.

# 🧠 AIRIS - AI-Powered Intelligent Representation of Sourcecode

AIRIS transforms source code into a dynamic, drag-and-drop visual flow editor — combining AST parsing, interactive UI, and AI-powered code generation. Built entirely with **Electron + Vanilla JS**, this project is designed to visualize and edit code in a modular and intuitive way.

---

## 🚀 Features

- 📦 Upload `.py` files and visualize code as draggable nodes
- 🧩 AST-based block structure with editable properties
- ➕ Create and connect nodes via "+" icons
- 🎯 Language-aware node types (e.g., `def`, `if`, `for`)
- ✍️ Edit node details (name, conditions, etc.)
- 💾 Save/load visual projects
- 🧠 AI-backed code generation from visual trees (via Ollama or GPT)
- 🪄 Smooth panning, zooming, and animated interactions

## 🛠️ Setup Instructions

### 1. Clone the Repo


git clone https://github.com/your-username/AIRIS.git
cd AIRIS


### 2. Install Dependencies


npm install

### 3. Run the App

npm start



## 📦 Exporting to `.exe` (Windows)

### Install electron-builder

npm install --save-dev electron-builder


### Add build script to `package.json`

"scripts": {
  "start": "electron .",
  "build": "electron-builder"
}


### Build Executable

npm run build


> `.exe` will be in the `dist/` folder after build.



## 🧠 Technologies Used

* **Electron** - Desktop App Framework
* **JavaScript (Vanilla)** - UI + Logic
* **Python AST Parsing** - Backend structure generation
* **Node.js / Express (optional)** - For API endpoints
* **Ollama / GPT** - AI-powered code generation



## 📁 Folder Structure


AIRIS/
│
├── main.js                 # Electron main process
├── index.html              # UI layout
├── renderer.js             # Handles UI events
├── parser.py               # Python AST logic
├── assets/                 # Icons, logos
├── nodes/                  # Dynamic node types
└── utils/                  # Connection + code generation helpers



## 💡 Vision

AIRIS isn’t just a code viewer — it’s a **creative AI-driven workspace**. Think like Figma for code. It reimagines how we write, teach, and collaborate on source code visually.



## 🧠 Future Plans

* ✅ Multi-language support (JavaScript, Java, C++)
* ✅ AI-based suggestions for code fixes/improvements
* ✅ Realtime LLM integration
* ✅ Team collaboration + GitHub sync
* ✅ AST-to-flowchart and vice-versa conversion



## 🧑‍💻 Author

**Sharvesh** — Passionate about visual coding, AI interfaces, and making dev tools fun + smart.



## 📜 License

MIT — free to use, clone, fork, or remix. Contribute and make AIRIS more powerful!
