import React, { useState, useEffect } from 'react';
import '../css/notemate.css';
import '../css/ParticipantList.css';

const ParticipantList = ({
  users,
  isRecording,
  elapsed,
  onUpdateUsers,
  getTranscriptData,
  meetingDate,
  hostName,
  setSendMessage,
  setModalStep,
  setSendEmailFn
}) => {
  const [filterType, setFilterType] = useState('이름');
  const [filter, setFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [newUser, setNewUser] = useState('');

  const inputValue = filter;

  const filteredUsers = users.filter(user =>
    (filterType === '이름' ? user.name : user.email).includes(filter)
  );

  const handleDelete = (index) => {
    const updated = [...users];
    updated.splice(index, 1);
    onUpdateUsers(updated);
  };

  const handleCheck = (index) => {
    const updated = [...users];
    updated[index].selected = !updated[index].selected;
    onUpdateUsers(updated);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    setNewUser(value);

    if (value.length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = users
      .map(user => (filterType === '이름' ? user.name : user.email))
      .filter(val => val.includes(value));

    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (value) => {
    setFilter(value);
    setNewUser(value);
    setSuggestions([]);
  };

  const handleRegister = () => {
    if (newUser.trim() === '') return;

    const newEntry =
      filterType === '이름'
        ? { name: newUser, email: '', selected: false }
        : { name: '', email: newUser, selected: false };

    onUpdateUsers([...users, newEntry]);
    setFilter('');
    setNewUser('');
    setSuggestions([]);
  };

  const handleSelectAll = () => {
    const updated = users.map(user => ({ ...user, selected: true }));
    onUpdateUsers(updated);
  };

  const handleSendEmail = async () => {
    const selectedEmails = users.filter(user => user.selected).map(user => user.email);
    if (selectedEmails.length === 0) {
      alert("수신자를 선택해주세요.");
      return;
    }

    const { transcript, summary } = getTranscriptData?.() || {};

    const formData = new FormData();
    selectedEmails.forEach(email => formData.append("recipients", email));
    formData.append("subject", `Notemate에서 ${meetingDate} 회의록 전달드립니다`);
    formData.append(
      "body",
      `📅 회의 일자: ${meetingDate}\n👤 주최자: ${hostName}`
    );
    formData.append("transcript_file", new File([transcript], `${meetingDate}_회의록_전문.txt`, { type: "text/plain" }));
    formData.append("summary_file", new File([summary], `${meetingDate}_회의록_요약.txt`, { type: "text/plain" }));

    try {
      const res = await fetch('http://localhost:8000/send-email', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      setSendMessage(result.message || "전송 완료");
      setModalStep('sending_complete');
      console.log("요청 보냄");
    } catch (err) {
      setSendMessage("이메일 전송 실패: " + err.message);
      setModalStep('sending_error');
      console.log("요청 실패");
    }
  };

  useEffect(() => {
    if (setSendEmailFn) {
      setSendEmailFn(() => handleSendEmail);
    }
  }, [setSendEmailFn]);



  return (
    <div className="record-left">
      <h2>참가자 목록</h2>

      {/* 검색 + 등록 */}
      <div className="search-bar">
        <select value={filterType} onChange={(e) => {
          setFilterType(e.target.value);
          setSuggestions([]);
        }}>
          <option>이름</option>
          <option>이메일</option>
        </select>
        <input
          type="text"
          className="search-input"
          placeholder={`${filterType} 검색`}
          value={inputValue}
          onChange={handleInputChange}
        />
        <button className="register-btn" onClick={handleRegister}>등록</button>
        {suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((item, idx) => (
              <li key={idx} onClick={() => handleSelectSuggestion(item)}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 테이블 헤더 */}
      <div className="table-header">
        <span>선택</span>
        <span>이름</span>
        <span>이메일</span>
        <span>삭제</span>
      </div>

      {/* 참가자 리스트 */}
      <ul className="user-list">
        {filteredUsers.map((user, idx) => (
          <li key={idx}>
            <input
              type="checkbox"
              checked={user.selected || false}
              onChange={() => handleCheck(idx)}
            />
            <span>{user.name}</span>
            <span>{user.email}</span>
            <button onClick={() => handleDelete(idx)}>✕</button>
          </li>
        ))}
      </ul>

      {/* 하단 버튼 */}
      {!isRecording && elapsed > 0 && (
        <div className="participant-actions">
          <button className="select-all-btn" onClick={handleSelectAll}>전체 선택</button>
          <button className="send-btn" onClick={() => setModalStep('sendConfirm')}>📩 전송</button>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
