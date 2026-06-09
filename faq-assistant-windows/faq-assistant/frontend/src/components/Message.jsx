const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="8" width="18" height="12" rx="2"/>
    <path d="M8 8V5a4 4 0 0 1 8 0v3"/>
    <circle cx="9" cy="14" r="1" fill="currentColor"/>
    <circle cx="15" cy="14" r="1" fill="currentColor"/>
  </svg>
);

// Render content with basic markdown-like formatting
const renderContent = (text) => {
  if (!text) return null;
  // Split on code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3).split("\n");
      const lang = lines[0];
      const code = lines.slice(1).join("\n").replace(/```$/, "").trim();
      return (
        <pre key={i} style={{ margin: "0.6em 0" }}>
          {lang && <span style={{ color: "var(--text-muted)", fontSize: "0.8em", display: "block", marginBottom: "0.4em" }}>{lang}</span>}
          <code>{code}</code>
        </pre>
      );
    }
    // Inline formatting
    const html = part
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^### (.+)$/gm, '<p style="font-weight:700;font-size:0.95em;color:#c4b5fd;margin:0.8em 0 0.2em">$1</p>')
      .replace(/^## (.+)$/gm, '<p style="font-weight:700;font-size:1.05em;color:#c4b5fd;margin:0.8em 0 0.2em">$1</p>')
      .replace(/^# (.+)$/gm, '<p style="font-weight:800;font-size:1.1em;color:#c4b5fd;margin:0.8em 0 0.3em">$1</p>')
      .replace(/^\s*[-*]\s(.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/^\s*\d+\.\s(.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");
    return <p key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ margin: 0 }} />;
  });
};

const formatTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export default function Message({ role, content, timestamp, streaming }) {
  const isUser = role === "user";

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10,
      padding: "6px 0",
      alignItems: "flex-start",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isUser ? "var(--accent)" : "var(--bg-card)",
        border: isUser ? "none" : "1px solid var(--border-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isUser ? "#fff" : "var(--accent)",
        marginTop: 2,
      }}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "72%",
        background: isUser ? "var(--user-bubble)" : "var(--ai-bubble)",
        border: `1px solid ${isUser ? "var(--user-border)" : "var(--border)"}`,
        borderRadius: isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
        padding: "10px 14px",
      }}>
        <div className="msg-content" style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)" }}>
          {renderContent(content)}
          {streaming && <span className="cursor" />}
        </div>
        {timestamp && !streaming && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: isUser ? "right" : "left" }}>
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}
