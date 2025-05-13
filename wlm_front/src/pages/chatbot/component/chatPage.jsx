import React, { useState } from 'react';
import '../css/chatPage.css';
import Sidebar from './sideBar.jsx';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // 간단한 모델 응답 예시 (실제로는 API 연결 필요)
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `답변: ${input}에 대한 응답입니다.` },
      ]);
    }, 500);
  };

  return (
    <>
        {/* <Sidebar history={history} onSelect={loadHistory} /> */}
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                    {msg.content}
                </div>
                ))}
            </div>
            <div className="input-area">
                <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    </>
  );
};

export default ChatPage;
