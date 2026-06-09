import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  const handleNewChat = () => {
    setSessionId(null);
    setSidebarKey((k) => k + 1);
  };

  const handleSelect = (sid) => {
    setSessionId(sid);
  };

  const handleSessionChange = (sid) => {
    setSessionId(sid);
    setSidebarKey((k) => k + 1);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        key={sidebarKey}
        currentSessionId={sessionId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        sessionId={sessionId}
        onSessionChange={handleSessionChange}
      />
    </div>
  );
}
