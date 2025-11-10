import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// POST /api/ai/counselling
router.post("/", async (req, res) => {
  const { question } = req.body;

  // Set up streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Call Ollama local model API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `You are an empathetic AI career counsellor. User asked: ${question}`,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    // Stream Ollama’s response to the frontend
    for await (const chunk of response.body) {
      const text = chunk.toString();
      const lines = text.trim().split("\n");
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            res.write(`data: ${data.response}\n\n`);
          }
        } catch {
          // Ignore invalid JSON lines
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Counselling stream error:", error.message);
    res.write("data: [ERROR]\n\n");
    res.end();
  }
});

export default router;
