import React, { useState } from 'react';
import styles from '../css/ChatArea.module.css';

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    // 입력 초기화
    setInput('');

    // 모의 AI 응답 추가 (실제 API 연동 가능)
    const aiResponse = {
      text: `AI 응답: "${input}"에 대한 답변입니다.`,
      isUser: false,
    };

    // 응답 메시지 추가 (약간의 지연 포함 시 realistic)
    setTimeout(() => {
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatArea}>
      <div className={styles.chatContent}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.aiMessage}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="text"
          placeholder="Type your message..."
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.sendButton} onClick={handleSend}>⬆️</button>
      </div>
    </div>
  );
};

export default ChatArea;
