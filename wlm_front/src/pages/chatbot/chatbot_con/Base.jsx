import React from 'react';
import Sidebar from '../component/SideBar.jsx';
import ChatArea from '../component/ChatArea.jsx';
import styles from './base.module.css';

function Base() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default Base;