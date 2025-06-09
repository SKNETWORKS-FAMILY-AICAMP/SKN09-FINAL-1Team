import React, { useState } from 'react';
import Sidebar from '../component/sideBar.jsx';
import ChatArea from '../component/ChatArea.jsx';
import styles from './Base.module.css';

function Base() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`${styles.chatArea} ${!isSidebarOpen ? styles.full : ''}`}>
        <ChatArea />
      </div>
    </div>
  );
}

export default Base;
