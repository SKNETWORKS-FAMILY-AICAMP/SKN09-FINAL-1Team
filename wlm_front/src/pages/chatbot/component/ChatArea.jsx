import React, { useState, useRef } from 'react';
import styles from '../css/ChatArea.module.css';
import ReactMarkdown from 'react-markdown';
import { FaFilePdf, FaTimes } from 'react-icons/fa'; // 아이콘

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

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
        formData.append('files', f);
      });
      for (let pair of formData.entries()) {
      console.log(`[FormData] ${pair[0]}:`, pair[1]);
      }


      const res = await fetch('http://localhost:8001/ask', {
        method: 'POST',
        body: formData,
        credentials: 'include',
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

    setFiles([]);
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
    const MAX_FILE_COUNT = 5;
    const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
  
    if (!e.target.files) return;
  
    const selected = Array.from(e.target.files);
    const fileCount = selected.length;
    const totalSize = selected.reduce((acc, file) => acc + file.size, 0);
  
    if (fileCount > MAX_FILE_COUNT) {
      alert(`최대 ${MAX_FILE_COUNT}개 파일까지만 업로드할 수 있습니다.`);
      return;
    }
  
    if (totalSize > MAX_TOTAL_SIZE) {
      alert("전체 파일 크기는 100MB를 초과할 수 없습니다.");
      return;
    }
  
    setFiles(selected);
  };


  const handleRemoveFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
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
        {files.length > 0 && (
          <div className={styles.selectedFileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <FaFilePdf className={styles.fileIcon} />
                <span className={styles.fileName} title={file.name}>
                  {file.name}
                </span>
                <FaTimes
                  className={styles.removeIcon}
                  onClick={() => handleRemoveFile(index)}
                  title="삭제"
                />
              </div>
            ))}
          </div>
        )}
        <div className={styles.inputRow}>
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
      </div>
    </div>
  );
};

export default ChatArea;
