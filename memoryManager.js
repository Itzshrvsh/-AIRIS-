const fs = require('fs');
const path = './data/memory.json';

function loadMemory() {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path));
}
function saveMemory(data) {
  fs.writeFileSync('memory.json', JSON.stringify(data, null, 2));
}


function remember(key, value) {
  const memory = loadMemory();
  memory[key] = value;
  saveMemory(memory);
}

function recall(key) {
  const memory = loadMemory();
  return memory[key];
}

function logChat(message) {
  const memory = loadMemory();
  memory.chatHistory = memory.chatHistory || [];
  memory.chatHistory.push({ time: new Date().toISOString(), message });
  saveMemory(memory);
}

module.exports = { remember, recall, logChat, loadMemory };
