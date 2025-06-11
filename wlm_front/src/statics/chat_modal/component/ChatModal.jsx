import React, { useState } from 'react';
import styles from '../css/ChatModal.module.css';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

const ChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 무엇을 도와드릴까요?', isAI: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (message) => {
    // 이미 로딩 중이면 추가 입력 방지
    if (isLoading) return;

    setIsLoading(true);
    
    // 사용자 메시지 추가
    const userMessage = {
      id: messages.length + 1,
      text: message,
      isAI: false,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // API 호출
      const response = await fetch('http://localhost:8001/miniask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message
        }),
      });

      if (!response.ok) {
        throw new Error('API 응답에 실패했습니다.');
      }

      const data = await response.json();
      
      // AI 응답 메시지 추가
      const aiMessage = {
        id: messages.length + 2,
        text: data.answer || '죄송합니다. 응답을 받지 못했습니다.',
        isAI: true,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API 오류:', error);
      // 에러 처리
      const errorMessage = {
        id: messages.length + 2,
        text: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        isAI: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={handleModalClick}>
        <div className={styles.modalHeader}>
          <h3>민원챗봇</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        <ChatHistory messages={messages} />
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatModal; 