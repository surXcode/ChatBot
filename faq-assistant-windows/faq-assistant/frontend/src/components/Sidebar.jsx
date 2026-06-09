import { useState, useEffect } from "react";
import { fetchConversations, deleteConversation } from "../api";

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="8" width="18" height="12" rx="2"/>
    <path d="M8 8V5a4 4 0 0 1 8 0v3"/><circle cx="9" cy="14" r="1" fill="currentColor"/>
    <circle cx="15" cy="14" r="1" fill="currentColor"/>
  </svg>
);

const formatDate = (d) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function Sidebar({ currentSessionId, onSelect, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    load();
  }, [debounced]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchConversations(debounced);
      setConversations(data.conversations);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await deleteConversation(sessionId);
      setConversations((prev) => prev.filter((c) => c.sessionId !== sessionId));
      if (currentSessionId === sessionId) onNewChat();
    } catch {}
  };

  return (
    <aside style={{
      width: 260, minWidth: 260, background: "var(--bg-panel)",
      borderRight: "1px solid var(--border)", display: "flex",
      flexDirection: "column", height: "100vh", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <BotIcon />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>FAQ Assistant</span>
        </div>
        <button onClick={onNewChat} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 7, padding: "9px 0", background: "var(--accent)", border: "none",
          borderRadius: "var(--radius-sm)", color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer", transition: "background var(--transition)", fontFamily: "var(--font)"
        }}
          onMouseEnter={e => e.target.style.background = "var(--accent-hover)"}
          onMouseLeave={e => e.target.style.background = "var(--accent)"}
        >
          <PlusIcon /> New Chat
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            style={{
              width: "100%", padding: "8px 10px 8px 32px",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
              fontSize: 13, fontFamily: "var(--font)", outline: "none"
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {loading && (
          <div style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", padding: 20 }}>Loading…</div>
        )}
        {!loading && conversations.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", padding: 20 }}>
            {search ? "No results found" : "No conversations yet"}
          </div>
        )}
        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => onSelect(conv.sessionId)}
            style={{
              padding: "10px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer",
              background: currentSessionId === conv.sessionId ? "var(--accent-glow)" : "transparent",
              border: currentSessionId === conv.sessionId ? "1px solid rgba(124,106,247,0.3)" : "1px solid transparent",
              marginBottom: 2, transition: "all var(--transition)", position: "relative",
              display: "flex", flexDirection: "column", gap: 3
            }}
            onMouseEnter={e => {
              if (currentSessionId !== conv.sessionId) e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.querySelector(".del-btn").style.opacity = "1";
            }}
            onMouseLeave={e => {
              if (currentSessionId !== conv.sessionId) e.currentTarget.style.background = "transparent";
              e.currentTarget.querySelector(".del-btn").style.opacity = "0";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {conv.title}
              </span>
              <button
                className="del-btn"
                onClick={(e) => handleDelete(e, conv.sessionId)}
                style={{ opacity: 0, background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "2px 4px", transition: "opacity var(--transition)", marginLeft: 6, flexShrink: 0 }}
              >
                <TrashIcon />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {conv.messageCount} messages
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {formatDate(conv.updatedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
