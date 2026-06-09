import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    title: { type: String, default: "New Conversation" },
    messages: [messageSchema],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Index for text search on messages
conversationSchema.index({ "messages.content": "text", title: "text" });

export default mongoose.model("Conversation", conversationSchema);
