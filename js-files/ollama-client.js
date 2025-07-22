const { spawn } = require('child_process');

function askOllama(prompt, callback) {
  const ollama = spawn('ollama', ['run', 'llama3']); // change model as needed

  let response = '';
  ollama.stdout.on('data', (data) => response += data.toString());

  ollama.stderr.on('data', (data) => console.error('Ollama error:', data.toString()));

  ollama.on('close', () => {
    callback(response);
  });

  ollama.stdin.write(prompt + '\n');
  ollama.stdin.end();
}

module.exports = { askOllama };
