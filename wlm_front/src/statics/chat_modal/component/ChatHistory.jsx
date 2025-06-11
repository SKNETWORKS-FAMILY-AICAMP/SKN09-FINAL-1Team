import React, { useEffect, useRef } from 'react';
import styles from '../css/ChatHistory.module.css';

const ChatHistory = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatHistory}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.message} ${
            message.isAI ? styles.aiMessage : styles.userMessage
          }`}
        >
          {message.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatHistory; 