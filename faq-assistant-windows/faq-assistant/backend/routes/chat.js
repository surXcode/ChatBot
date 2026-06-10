import express from "express";
import Groq from "groq-sdk";
import Conversation from "../models/Conversation.js";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a helpful FAQ assistant. You answer questions clearly, concisely, and accurately.
- Keep answers focused and easy to understand.
- Use bullet points or numbered lists when listing multiple items.
- If you don't know something, say so honestly.
- Be friendly and professional.`;

router.post("/", async (req, res) => {
  const { question, sessionId, conversationHistory = [] } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: question },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullAnswer = "";

  try {
    const stream = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages,
      stream: true,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullAnswer += text;
        res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
      }
    }

    let conversation = await Conversation.findOne({ sessionId });
    const timestamp = new Date();

    if (!conversation) {
      const title = question.length > 60 ? question.slice(0, 57) + "..." : question;
      conversation = new Conversation({ sessionId, title, messages: [] });
    }

    conversation.messages.push(
      { role: "user", content: question, timestamp },
      { role: "assistant", content: fullAnswer, timestamp: new Date() }
    );
    await conversation.save();

    res.write(`data: ${JSON.stringify({ type: "done", conversationId: conversation._id, timestamp: timestamp.toISOString() })}\n\n`);
    res.end();

  } catch (err) {
    console.error("GROQ API error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
    res.end();
  }
});

export default router;
