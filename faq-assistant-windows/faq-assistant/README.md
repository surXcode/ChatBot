# 🤖 FAQ Assistant — AI-Powered Chatbot

A full-stack AI chatbot built with **React**, **Node.js + Express**, **MongoDB**, and **Claude (Anthropic)**. Features real-time streaming responses, persistent conversation history, and conversation search.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────┐
│   React Frontend│────▶│ Express.js Backend    │────▶│ MongoDB  │
│   (Vite)        │◀────│ (REST + SSE Streaming)│     │          │
└─────────────────┘     └──────────┬───────────┘     └──────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  Anthropic Claude │
                         │  (Streaming API)  │
                         └──────────────────┘
```

**Key design decisions:**
- **Server-Sent Events (SSE)** for streaming: allows the backend to push incremental tokens to the frontend without WebSockets, keeping the architecture simple.
- **Session-based conversations**: each chat session gets a UUID, making conversations shareable and persistent without requiring user authentication.
- **MongoDB text index** on `messages.content` enables full-text search across all conversation history.
- **Conversation context**: last 10 messages are sent as history with each request, giving Claude conversational memory without hitting token limits.

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd faq-assistant

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and set ANTHROPIC_API_KEY

# Frontend
cp frontend/.env.example frontend/.env
# Edit if your backend runs on a different port
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm start

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Docker Setup

```bash
# Copy and fill in env
cp backend/.env.example .env
# Set ANTHROPIC_API_KEY=sk-ant-...

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📡 API Reference

### `POST /api/chat`
Send a question; streams back the AI answer via SSE.

**Request body:**
```json
{
  "question": "What is machine learning?",
  "sessionId": "uuid-here",
  "conversationHistory": []
}
```

**SSE event stream:**
```
data: {"type":"delta","text":"Machine "}
data: {"type":"delta","text":"learning is..."}
data: {"type":"done","conversationId":"...","timestamp":"..."}
```

---

### `GET /api/conversations`
List all conversations (paginated, searchable).

| Query param | Default | Description |
|---|---|---|
| `search` | — | Full-text search |
| `page` | 1 | Page number |
| `limit` | 20 | Results per page |

---

### `GET /api/conversations/:sessionId`
Get full conversation with all messages.

---

### `DELETE /api/conversations/:sessionId`
Delete a conversation.

---

### `GET /api/health`
Health check — returns `{ status: "ok" }`.

---

## 📁 Project Structure

```
faq-assistant/
├── backend/
│   ├── models/
│   │   └── Conversation.js    # Mongoose schema
│   ├── routes/
│   │   ├── chat.js            # SSE streaming + Claude integration
│   │   └── conversations.js   # CRUD for conversation history
│   ├── server.js              # Express app entry point
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx  # Main chat UI with streaming
│   │   │   ├── Message.jsx     # Message bubble with markdown render
│   │   │   └── Sidebar.jsx     # Conversation list + search
│   │   ├── api.js              # API utility functions
│   │   ├── App.jsx             # Root component
│   │   └── index.css           # Global styles + CSS variables
│   ├── .env.example
│   └── Dockerfile
└── docker-compose.yml
```

---

## ✨ Features

- ✅ Real-time streaming AI responses (SSE)
- ✅ Persistent conversation history (MongoDB)
- ✅ Conversation sidebar with previews
- ✅ Full-text conversation search
- ✅ Delete conversations
- ✅ Multi-turn context (last 10 messages sent as history)
- ✅ Markdown rendering (code blocks, bold, lists)
- ✅ Suggested starter questions
- ✅ Dark theme
- ✅ Docker setup

---

## 🧠 Architectural Decisions

**Why SSE instead of WebSockets?**  
SSE is a simpler, HTTP-native solution for one-directional server→client streaming. Since the client only needs to receive tokens (not send data during streaming), SSE is sufficient and avoids WebSocket complexity.

**Why session IDs instead of user auth?**  
Keeps the app simple and stateless for this demo. In production, you'd associate sessions with authenticated users.

**Why MongoDB text indexes?**  
MongoDB's `$text` operator with text indexes allows efficient full-text search across the `messages.content` and `title` fields without needing a separate search service like Elasticsearch.

**Why limit history to 10 messages?**  
Each message sent to Claude consumes tokens and costs money. Sending only the recent window (10 messages) provides conversational continuity while managing API costs and staying within context limits.
