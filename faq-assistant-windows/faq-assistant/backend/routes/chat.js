import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import Conversation from "../models/Conversation.js";

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful FAQ assistant. You answer questions clearly, concisely, and accurately.
- Keep answers focused and easy to understand.
- Use bullet points or numbered lists when listing multiple items.
- If you don't know something, say so honestly.
- Be friendly and professional.`;

// POST /api/chat — send a message, get a streaming response
router.post("/", async (req, res) => {
  const { question, sessionId, conversationHistory = [] } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  // Build messages array for Claude (include recent history for context)
  const messages = [
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: question },
  ];

  // Set up streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullAnswer = "";

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        const text = chunk.delta.text;
        fullAnswer += text;
        res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
      }
    }

    // Save to MongoDB
    let conversation = await Conversation.findOne({ sessionId });
    const timestamp = new Date();

    if (!conversation) {
      // Generate a title from the first question (truncate to 60 chars)
      const title =
        question.length > 60 ? question.slice(0, 57) + "..." : question;
      conversation = new Conversation({ sessionId, title, messages: [] });
    }

    conversation.messages.push(
      { role: "user", content: question, timestamp },
      { role: "assistant", content: fullAnswer, timestamp: new Date() }
    );
    await conversation.save();

    res.write(
      `data: ${JSON.stringify({
        type: "done",
        conversationId: conversation._id,
        timestamp: timestamp.toISOString(),
      })}\n\n`
    );
    res.end();
  } catch (err) {
    console.error("Claude API error:", err);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`
    );
    res.end();
  }
});

export default router;
