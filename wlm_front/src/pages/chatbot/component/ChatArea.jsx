import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/ChatArea.module.css';
import ReactMarkdown from 'react-markdown';
import { FaFilePdf, FaTimes } from 'react-icons/fa';
import upArrowIcon from '../../images/up_arrow.png'
const ChatArea = ({ chatNo, setChatNo, newChat, onFirstMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
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
    if (onFirstMessageSent) onFirstMessageSent();
    setInput('');

    try {
      const formData = new FormData();
      formData.append('question', currentInput);
      formData.append("new_chat", newChat.toString());

      if (chatNo !== null && chatNo !== undefined) {
        formData.append("chat_no", chatNo.toString());
        console.log("chat_no:", chatNo);
      } else {
        console.log("chat_no 없음 - 새 채팅");
      }

      files.forEach((f) => {
        formData.append('files', f);
      });
      for (let pair of formData.entries()) {
      console.log(`[FormData] ${pair[0]}:`, pair[1]);
      }


      const res = await fetch('/model/ask', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (data.chat_no) {
        console.log("chat_no:", data.chat_no);
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

    // 파일 보낸 후 파일 리스트 초기화 비활성화
    // setFiles([]);
    // if (fileInputRef.current) {
    //   fileInputRef.current.value = '';
    // }
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


  const handleRemoveFile = async (index) => {
    try {
      // Qdrant 컬렉션 삭제 요청
      fetch("/qdrant/api/delete_temp_vectors", {
        method: 'DELETE',
      });
      console.log("=> qdrant_temp 컬렉션 삭제 완료");
    } catch (err) {
      console.error("=> Qdrant 컬렉션 삭제 실패:", err);
    }

    // 프론트 파일 리스트에서도 제거
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
  };


  return (
    <div className={styles.chatArea}>
      <div className={styles.chatContent} ref={chatContentRef}> {/* ✅ ref 적용 */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.aiMessage}`}
          >
            {msg.isUser ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
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
            ➕
          </label>
          <button
            type="button"
            className={styles.sendButton}
            onClick={handleSend}
            disabled={sending}
          >
            <img
              src={upArrowIcon}
              alt="send"
              className={styles.sendIcon}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;


// chat 수정
// import React, { useState, useRef, useEffect } from 'react';
// import styles from '../css/ChatArea.module.css';
// import ReactMarkdown from 'react-markdown';
// import { FaFilePdf, FaTimes } from 'react-icons/fa';
// import upArrowIcon from '../../images/up_arrow.png';

// const ChatArea = ({ chatNo, setChatNo, newChat, onFirstMessageSent, onSendMessage, onFileUpload }) => {
//   const [messages, setMessages] = useState([]);
//   const [firstView, setFirstView] = useState(true);
//   const [input, setInput] = useState('');
//   const [sending, setSending] = useState(false);
//   const [files, setFiles] = useState([]);

//   const fileInputRef = useRef(null);
//   const chatContentRef = useRef(null);

//   useEffect(() => {
//     if (chatContentRef.current) {
//       chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSend = async () => {
//     if (sending || !input.trim()) return;

//     const message = input.trim();
//     setInput('');
//     setSending(true);

//     if (firstView) {
//       console.log('첫 메시지 전환: firstView=false');
//       setFirstView(false);
//       if (onFirstMessageSent) onFirstMessageSent();
//     }

//     // 예: 부모 콜백으로 메시지 API 전송
//     const aiAnswer = await onSendMessage(message, files);

//     setMessages(prev => [
//       ...prev,
//       { text: message, isUser: true },
//       { text: aiAnswer, isUser: false }
//     ]);

//     setFiles([]);
//     if (fileInputRef.current) fileInputRef.current.value = '';

//     setSending(false);
//   };

//   const handleKeyDown = e => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleFileChange = e => {
//     const selected = Array.from(e.target.files);
//     setFiles(prev => [...prev, ...selected]);
//     if (onFileUpload) onFileUpload(selected);
//   };

//   const handleRemoveFile = index => {
//     const newArr = files.filter((_, i) => i !== index);
//     setFiles(newArr);
//   };

//   return (
//     <div className={styles.chatArea}>
//       {firstView ? (
//         <div className={styles.firstView}>
//           <h2 className={styles.welcomeText}>채팅을 입력해주세요</h2>
//           <div className={styles.firstInputBox}>
//             <input
//               type="file"
//               accept="application/pdf"
//               multiple
//               style={{ display: 'none' }}
//               ref={fileInputRef}
//               onChange={handleFileChange}
//             />
//             <label htmlFor="pdf-upload" className={styles.uploadButton}>+</label>
//             <input
//               type="text"
//               placeholder="메시지를 입력하세요"
//               className={styles.input}
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button className={styles.sendButton} onClick={handleSend} disabled={sending}>
//               <img src={upArrowIcon} alt="send" className={styles.sendIcon} />
//             </button>
//           </div>
//           {files.length > 0 && (
//             <div className={styles.selectedFileList}>
//               {files.map((f, i) => (
//                 <div key={i} className={styles.fileItem}>
//                   <FaFilePdf className={styles.fileIcon} />
//                   <span className={styles.fileName} title={f.name}>{f.name}</span>
//                   <FaTimes className={styles.removeIcon} onClick={() => handleRemoveFile(i)} />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ) : (
//         <>
//           <div className={styles.chatContent} ref={chatContentRef}>
//             {messages.map((msg, idx) => (
//               <div key={idx} className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.aiMessage}`}>
//                 {msg.isUser ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
//               </div>
//             ))}
//           </div>

//           <div className={styles.inputWrapper}>
//             <input
//               type="file"
//               accept="application/pdf"
//               multiple
//               style={{ display: 'none' }}
//               ref={fileInputRef}
//               onChange={handleFileChange}
//             />
//             <label htmlFor="pdf-upload" className={styles.uploadButton}>+</label>
//             <input
//               type="text"
//               placeholder="메시지를 입력하세요"
//               className={styles.input}
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <button className={styles.sendButton} onClick={handleSend} disabled={sending}>
//               <img src={upArrowIcon} alt="send" className={styles.sendIcon} />
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatArea;






