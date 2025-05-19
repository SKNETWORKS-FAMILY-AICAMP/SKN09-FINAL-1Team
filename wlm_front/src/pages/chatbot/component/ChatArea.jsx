import React, { useState, useRef } from 'react';
import styles from '../css/ChatArea.module.css';
import ReactMarkdown from 'react-markdown';

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);  // 추가
  const fileInputRef = useRef(null);

const handleSend = async () => {
  if (sending) return;
  setSending(true);

  const currentInput = input.trim();

  // 입력 없고 파일도 없으면 종료
  if (!currentInput && !file) {
    setSending(false);
    return;
  }

  console.log('handleSend called with input:', currentInput);

  const userMessage = { text: currentInput, isUser: true };
  setMessages(prev => [...prev, userMessage]);
  setInput('');

  try {
    const formData = new FormData();
    formData.append('question', currentInput);
    if (file) {
      formData.append('file', file);
    }

    const res = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    const aiResponse = {
      text: data.answer || data.error || '응답이 없습니다.',
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

  setSending(false);
};


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
          disabled={sending}  // 전송 중 입력 막기 선택 사항
        />
        <input
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          id="pdf-upload"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={sending}  // 전송 중 파일 선택 막기 선택 사항
        />
        <label htmlFor="pdf-upload" className={styles.uploadButton} title="PDF 업로드">
          💾
        </label>
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          disabled={sending}  // 전송 중 버튼 비활성화
        >
          Send
        </button>
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
