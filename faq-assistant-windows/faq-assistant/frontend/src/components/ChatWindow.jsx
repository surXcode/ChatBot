import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Message from "./Message";
import { streamChat, fetchConversation } from "../api";

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const SUGGESTED = [
  "What is artificial intelligence?",
  "How does machine learning work?",
  "Explain REST APIs in simple terms.",
  "What are the best practices for writing clean code?",
];

export default function ChatWindow({ sessionId, onSessionChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const activeSessionRef = useRef(sessionId);

  // Load conversation when sessionId changes
  useEffect(() => {
    activeSessionRef.current = sessionId;
    if (sessionId) {
      loadConversation(sessionId);
    } else {
      setMessages([]);
      setStreamingContent("");
    }
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const loadConversation = async (sid) => {
    try {
      const data = await fetchConversation(sid);
      if (activeSessionRef.current === sid) {
        setMessages(data.messages || []);
        setStreamingContent("");
      }
    } catch {
      // New conversation - no history
      setMessages([]);
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const sid = sessionId || uuidv4();
    if (!sessionId) onSessionChange(sid);

    setInput("");
    setError(null);
    setLoading(true);
    setStreamingContent("");

    const userMsg = { role: "user", content: question, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    let accumulated = "";

    try {
      await streamChat(
        question,
        sid,
        messages.map((m) => ({ role: m.role, content: m.content })),
        (delta) => {
          accumulated += delta;
          setStreamingContent(accumulated);
        },
        (done) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: accumulated, timestamp: done.timestamp },
          ]);
          setStreamingContent("");
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
          setStreamingContent("");
        }
      );
    } catch (e) {
      setError(e.message);
      setLoading(false);
      setStreamingContent("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {isEmpty ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
                How can I help you?
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Ask me anything — I'll do my best to answer clearly.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 560, width: "100%" }}>
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)", padding: "12px 14px",
                    color: "var(--text-secondary)", fontSize: 13, textAlign: "left",
                    cursor: "pointer", fontFamily: "var(--font)", lineHeight: 1.4,
                    transition: "all var(--transition)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {messages.map((msg, i) => (
              <Message key={i} {...msg} />
            ))}
            {streamingContent && (
              <Message role="assistant" content={streamingContent} streaming />
            )}
          </div>
        )}
        {error && (
          <div style={{
            maxWidth: 760, margin: "12px auto",
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px",
            color: "var(--danger)", fontSize: 13
          }}>
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 32px 24px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "var(--bg-input)", border: "1px solid var(--border-light)",
            borderRadius: "var(--radius)", padding: "10px 12px",
            transition: "border-color var(--transition)",
            boxShadow: "0 0 0 0 var(--accent-glow)"
          }}
            onFocus={() => {}}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font)",
                resize: "none", maxHeight: 160, lineHeight: 1.6,
                overflowY: "auto"
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 8, border: "none",
                background: input.trim() && !loading ? "var(--accent)" : "var(--border)",
                color: "#fff", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background var(--transition)",
              }}
            >
              {loading ? (
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : <SendIcon />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            Powered by Claude · Conversations are saved automatically
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
