import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// GET /api/conversations — list all conversations (newest first)
router.get("/", async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("sessionId title updatedAt messages")
        .lean(),
      Conversation.countDocuments(query),
    ]);

    // Return summary (last message preview) for the list
    const summaries = conversations.map((c) => ({
      _id: c._id,
      sessionId: c.sessionId,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      preview:
        c.messages.length > 0
          ? c.messages[c.messages.length - 1].content.slice(0, 100) + "..."
          : "",
    }));

    res.json({ conversations: summaries, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:sessionId — get full conversation by sessionId
router.get("/:sessionId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      sessionId: req.params.sessionId,
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/conversations/:sessionId — delete a conversation
router.delete("/:sessionId", async (req, res) => {
  try {
    const result = await Conversation.deleteOne({
      sessionId: req.params.sessionId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
