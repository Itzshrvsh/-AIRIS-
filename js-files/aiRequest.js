const axios = require('axios');

async function askAI(prompt) {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      prompt,
      model: 'llama3',
      stream: false
    });

    return response.data.response || "⚠️ AI gave no answer.";
  } catch (error) {
    console.error("[🔥 AI Error]:", error.message);
    return "⚠️ AI is currently unavailable.";
  }
}

module.exports = { askAI };
