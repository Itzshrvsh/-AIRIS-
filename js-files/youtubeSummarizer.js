// js-files/youtubeSummarizer.js
const fs = require("fs");
const { exec } = require("child_process");
const { askAI } = require("./aiRequest");

function normalizeURL(url) {
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url;
}

function extractVTTText(vttPath) {
  const vttData = fs.readFileSync(vttPath, "utf8");
  return vttData
    .split("\n")
    .filter((line) => line && !line.includes("-->") && isNaN(line))
    .join(" ");
}

async function runYouTubeSummary(url) {
  return new Promise((resolve, reject) => {
    url = normalizeURL(url);
    console.log("📥 Normalized URL:", url);

    const cmd = `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "ytvideo.%(ext)s" "${url}"`;

    exec(cmd, async (err, stdout, stderr) => {
      if (err) return reject(stderr);

      console.log("✅ Subtitles downloaded.");
      const vttPath = "ytvideo.en.vtt";
      if (!fs.existsSync(vttPath)) return reject("Subtitle file not found");

      const rawText = extractVTTText(vttPath);
      console.log("📄 Extracted raw subtitle text.");

      const fullPrompt = `Summarize this YouTube video clearly and professionally:\n\n${rawText}`;
      const shortPrompt = `Summarize this YouTube video in just 1 short, punchy line:\n\n${rawText}`;

      const fullSummary = await askAI(fullPrompt);
      const shortSummary = await askAI(shortPrompt);

      fs.writeFileSync("youtube_summary.txt", fullSummary, "utf8");

      resolve({ full: fullSummary, short: shortSummary });
    });
  });
}


module.exports = { runYouTubeSummary };
