import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/ChatArea.module.css';
import ReactMarkdown from 'react-markdown';
import { FaFilePdf, FaTimes } from 'react-icons/fa';
import upArrowIcon from '../../images/up_arrow.png';

const ChatArea = ({ chatNo, setChatNo, newChat, onFirstMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const [firstView, setFirstView] = useState(true);

  const fileInputRef = useRef(null);
  const chatContentRef = useRef(null);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (chatNo) {
      fetch(`/model/chat_log?chat_no=${chatNo}`)
        .then(res => res.json())
        .then(data => {
          const formatted = data.map(msg => ({
            text: msg.text,
            isUser: msg.sender === "user"
          }));
          setMessages(formatted);
          setFirstView(false);
        });
    } else {
      setMessages([]);
    }
  }, [chatNo]);

  const handleSend = async () => {
    if (sending) return;
    setSending(true);

    const currentInput = input.trim();

    if (!currentInput && files.length === 0) {
      setSending(false);
      return;
    }

    const userMessage = { text: currentInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    if (firstView) {
      setFirstView(false);
      if (onFirstMessageSent) onFirstMessageSent();
    }

    setInput('');

    try {
      const formData = new FormData();
      formData.append('question', currentInput);
      formData.append("new_chat", newChat.toString());

      if (chatNo !== null && chatNo !== undefined) {
        formData.append("chat_no", chatNo.toString());
      }

      files.forEach((f) => {
        formData.append('files', f);
      });

      const res = await fetch('/model/ask', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (data.chat_no) {
        setChatNo(data.chat_no);
      }

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
    const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

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

  const handleRemoveFile = async (index) => {
    try {
      await fetch("/model/delete_vectors", {
        method: 'DELETE',
      });
      console.log("Qdrant 컬렉션 삭제 완료");
    } catch (err) {
      console.error("Qdrant 컬렉션 삭제 실패:", err);
    }

    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
  };

  return (
    <div className={styles.chatArea}>
      {firstView ? (
        <div className={styles.firstView}>
          <h2 className={styles.welcomeText}>채팅을 입력해주세요</h2>
          <div className={styles.firstInputBox}>
            <input
              type="text"
              className={styles.input}
              placeholder="메시지를 입력하세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button className={styles.sendButton} onClick={handleSend} disabled={sending}>
              <img src={upArrowIcon} alt="send" className={styles.sendIcon} />
            </button>
            <label htmlFor="file-upload" className={styles.uploadButton}>
              ➕
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={sending}
            />
          </div>

          {files.length > 0 && (
            <div className={styles.selectedFileList}>
              {files.map((file, i) => (
                <div key={i} className={styles.fileItem}>
                  <FaFilePdf className={styles.fileIcon} />
                  <span className={styles.fileName} title={file.name}>{file.name}</span>
                  <FaTimes className={styles.removeIcon} onClick={() => handleRemoveFile(i)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={styles.chatContent} ref={chatContentRef}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.aiMessage}`}
              >
                {msg.isUser ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
              </div>
            ))}
          </div>

          <div className={styles.inputWrapper}>
            {files.length > 0 && (
              <div className={styles.selectedFileList}>
                {files.map((file, i) => (
                  <div key={i} className={styles.fileItem}>
                    <FaFilePdf className={styles.fileIcon} />
                    <span className={styles.fileName} title={file.name}>{file.name}</span>
                    <FaTimes className={styles.removeIcon} onClick={() => handleRemoveFile(i)} />
                  </div>
                ))}
              </div>
            )}
            <div className={styles.inputRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="메시지를 입력하세요"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button className={styles.sendButton} onClick={handleSend} disabled={sending}>
                <img src={upArrowIcon} alt="send" className={styles.sendIcon} />
              </button>
              <label htmlFor="pdf-upload" className={styles.uploadButton} title="PDF 업로드">
                ➕
              </label>
              <input
                id="pdf-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={sending}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatArea;










