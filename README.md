# 🤖 FAQ Assistant

A full-stack AI-powered FAQ chatbot built with React, Node.js, MongoDB, and Groq (LLaMA 3.3 70B). Supports streaming responses, conversation history, and session management.

---

## ✨ Features

- 💬 Real-time streaming AI responses
- 🧠 Conversation history (last 10 messages)
- 💾 MongoDB session storage
- ⚡ Powered by Groq's LLaMA 3.3 70B (free & fast)
- 🎨 Clean, modern UI built with React + Vite

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB |
| AI | Groq API (LLaMA 3.3 70B) |
| Streaming | Server-Sent Events (SSE) |

---

## 📁 Project Structure

```
faq-assistant/
├── backend/
│   ├── models/
│   │   └── Conversation.js
│   ├── routes/
│   │   ├── chat.js
│   │   └── conversations.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally)
- [Groq API Key](https://console.groq.com) (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/faq-assistant.git
cd faq-assistant
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb://localhost:27017/faq-assistant
PORT=5000
FRONTEND_URL=http://localhost:5173
```

> Get your free Groq API key at [console.groq.com](https://console.groq.com)

Start the backend:

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE ready in ~400ms
→ Local: http://localhost:5173/
```

---

### 4. Open the App

Visit **http://localhost:5173** in your browser and start chatting!

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Backend port (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

[MIT](LICENSE)
