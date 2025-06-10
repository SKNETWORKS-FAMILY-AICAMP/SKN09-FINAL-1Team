import React, { useState } from 'react';
import styles from '../css/ChatInput.module.css';

const ChatInput = ({ onSubmit, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message);
      setMessage('');
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isLoading ? "응답을 기다리는 중..." : "메시지를 입력하세요..."}
        className={styles.input}
        disabled={isLoading}
      />
      <button 
        type="submit" 
        className={styles.sendButton}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? "대기중" : "전송"}
      </button>
    </form>
  );
};

export default ChatInput; 