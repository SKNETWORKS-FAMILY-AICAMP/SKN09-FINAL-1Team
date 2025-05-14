import React, { useState, useRef } from 'react';
import styles from '../css/ChatArea.module.css';
import ReactMarkdown from 'react-markdown';

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    // 사용자 메시지 추가
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    // 입력 초기화
    setInput('');

    try {
      const formData = new FormData();
      formData.append('question', input);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const aiResponse = {
        text: data.answer,
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMsg = {
        text: 'AI 서버와 통신 중 오류가 발생했습니다.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
            {msg.isUser ? (
              msg.text
            ) : (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            )}
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
        <input
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          id="pdf-upload"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <label htmlFor="pdf-upload" className={styles.uploadButton} title="PDF 업로드">
          📎
        </label>
        <button className={styles.sendButton} onClick={handleSend}>⬆️</button>
      </div>

      {file && (
        <div className={styles.selectedFile}>
          {file.name}
        </div>
      )}
    </div>
  );
};

export default ChatArea;
