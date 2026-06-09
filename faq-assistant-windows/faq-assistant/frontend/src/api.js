const BASE = import.meta.env.VITE_API_URL || "/api";

export const streamChat = async (question, sessionId, conversationHistory, onDelta, onDone, onError) => {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, sessionId, conversationHistory }),
  });

  if (!res.ok) {
    const err = await res.json();
    onError(err.error || "Request failed");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const raw = decoder.decode(value);
    const lines = raw.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "delta") onDelta(data.text);
        else if (data.type === "done") onDone(data);
        else if (data.type === "error") onError(data.error);
      } catch {
        // ignore parse errors
      }
    }
  }
};

export const fetchConversations = async (search = "", page = 1) => {
  const params = new URLSearchParams({ page, limit: 20 });
  if (search) params.set("search", search);
  const res = await fetch(`${BASE}/conversations?${params}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
};

export const fetchConversation = async (sessionId) => {
  const res = await fetch(`${BASE}/conversations/${sessionId}`);
  if (!res.ok) throw new Error("Conversation not found");
  return res.json();
};

export const deleteConversation = async (sessionId) => {
  const res = await fetch(`${BASE}/conversations/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
};
