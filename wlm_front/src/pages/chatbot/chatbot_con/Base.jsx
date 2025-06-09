import React, { useState } from 'react';
import Sidebar from '../component/sideBar.jsx';
import ChatArea from '../component/ChatArea.jsx';
import styles from './Base.module.css';

function Base() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedChatNo, setSelectedChatNo] = useState(null);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onSelectChat={(chat_no) => setSelectedChatNo(chat_no)} />
      <div className={`${styles.chatArea} ${!isSidebarOpen ? styles.full : ''}`}>
        <ChatArea chatNo={selectedChatNo} newChat={!selectedChatNo} />
      </div>
    </div>
  );
}

export default Base;
