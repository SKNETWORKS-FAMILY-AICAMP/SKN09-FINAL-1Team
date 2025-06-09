import React, { useState } from 'react';
import Sidebar from '../component/sideBar.jsx';
import ChatArea from '../component/ChatArea.jsx';
import styles from './Base.module.css';

function Base() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedChatNo, setSelectedChatNo] = useState(null);
  const [newChat, setNewChat] = useState(true);

  const handleSelectChat = (chat_no) => {
    setSelectedChatNo(chat_no);
    setNewChat(false);
  };

  return (
    <div className={styles.container}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onSelectChat={handleSelectChat} />
      <div className={`${styles.chatArea} ${!isSidebarOpen ? styles.full : ''}`}>
        <ChatArea chatNo={selectedChatNo} setChatNo={setSelectedChatNo} newChat={newChat} onFirstMessageSent={() => setNewChat(false)} />
      </div>
    </div>
  );
}

export default Base;
