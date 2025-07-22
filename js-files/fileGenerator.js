const fs = require('fs');
const path = require('path');
const os = require('os');
function saveCodeToDesktop(code, language, filename = "Generated") {
  const extMap = {
    javascript: 'js',
    js: 'js',
    py: 'py',
    python: 'py',
    html: 'html',
    c: 'c',
    cpp: 'cpp',
    asm: 'asm',
    nasm: 'asm',
    java: 'java',
    txt: 'txt',
  };

  const ext = extMap[language.toLowerCase()] || 'txt';
  const fullFilename = `${filename}.${ext}`;  // ✅ Declare this before use!


  const outputDir = path.join(os.homedir(), 'Downloads'); 
  if (!fs.existsSync(outputDir)) {
    fs.writeFileSync(path.join(outputDir, 'GeneratedCodes'), yourFileContent , { recursive: true });
  }
  
  const outputPath = path.join(outputDir, fullFilename);
  fs.writeFileSync(outputPath, code, 'utf8');
  return outputPath;
}

module.exports = { saveCodeToDesktop };
