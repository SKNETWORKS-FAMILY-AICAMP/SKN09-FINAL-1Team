import React, { useState } from "react";
import "../css/ChatUI.css";


function ChatUI() {
  return (
    <div className="ow-root-layout">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default ChatUI;