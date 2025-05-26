import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/ChatArea.module.css';
import ReactMarkdown from 'react-markdown';

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]); // 여러 개의 파일 저장
  const fileInputRef = useRef(null); // 파일 input 초기화를 위한 참조


  const handleSend = async () => {
    if (sending) return;
    setSending(true);

    const currentInput = input.trim();

    if (!currentInput && files.length === 0) {
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
      files.forEach((f) => {
        formData.append('files', f); // 여러 개 파일 추가
      });

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

    setFiles([]); // 파일 초기화
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
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
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
          disabled={sending}
        />
        <input
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: 'none' }}
          id="pdf-upload"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={sending}
        />
        <label htmlFor="pdf-upload" className={styles.uploadButton} title="PDF 업로드">
          💾
        </label>
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          disabled={sending}
        >
          Send
        </button>
      </div>

      {files && files.length > 0 && (
        <div className={styles.selectedFile}>
          {files.map((f, idx) => (
            <div key={idx}>{f.name}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatArea;
