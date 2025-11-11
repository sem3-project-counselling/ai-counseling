const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const router = express.Router();

// POST /api/ai/counselling
router.post("/", async (req, res) => {
  const { question } = req.body;

  // Set up streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Pre-check if Ollama service is running
    const healthCheck = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
    });

    if (!healthCheck.ok) {
      res.write("data: Ollama service is not running. Please start Ollama and ensure the llama3 model is available.\n\n");
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

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
      let errorMessage = "An error occurred while processing your request.";
      if (response.status === 500) {
        errorMessage = "Internal server error from Ollama. Please check the model and try again.";
      } else if (response.status === 404) {
        errorMessage = "Model not found. Ensure llama3 is installed.";
      } else {
        errorMessage = `Ollama API error: ${response.status}`;
      }
      res.write(`data: ${errorMessage}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
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

module.exports = router;
