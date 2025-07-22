const { askAI } = require('./aiRequest');
const crypto = require('crypto');

let lastHash = null;

function hashBuffer(buf) {
  return crypto.createHash('md5').update(buf).digest('hex');
}

async function analyzeScreen(buffer) {
  const hash = hashBuffer(buffer);
  if (hash === lastHash) return null;
  lastHash = hash;

  const base64 = buffer.toString('base64').slice(0, 1000); // trimmed preview

  const prompt = `
This is a base64-encoded screenshot of a user's screen (partial):
"${base64}"
Based on this, roast the user in one sarcastic sentence if they're wasting time.
`;

  const result = await askAI(prompt);
  return result;
}

module.exports = { analyzeScreen };
