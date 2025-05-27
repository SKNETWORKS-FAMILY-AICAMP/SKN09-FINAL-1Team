import React, { useState, useEffect } from 'react';
import '../css/notemate.css';
import '../css/ParticipantList.css';

const ParticipantList = ({
  users,
  allUsers,
  isRecording,
  elapsed,
  onUpdateUsers,
  setModalStep,
  disableEmailButton
}) => {
  const [filterType, setFilterType] = useState('이름');
  const [filter, setFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);


  const inputValue = filter;


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

    const filtered = allUsers.filter(user =>
      user.name.includes(value) || user.email.includes(value)
    );

    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (user) => {
    setSelectedSuggestion(user);
    setFilter(`${user.name} (${user.email})`);
    setSuggestions([]);
  };


  const handleRegister = () => {
    if (!selectedSuggestion) {
      alert("목록에 있는 사용자를 선택해주세요.");
      return;
    }

    const alreadyAdded = users.some(u => u.email === selectedSuggestion.email);
    if (alreadyAdded) {
      alert("이미 추가된 사용자입니다.");
      return;
    }

    onUpdateUsers([...users, { ...selectedSuggestion, selected: false }]);
    setFilter('');
    setSelectedSuggestion(null);
  };


  const handleSelectAll = () => {
    const updated = users.map(user => ({ ...user, selected: true }));
    onUpdateUsers(updated);
  };

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
            {suggestions.map((user, idx) => (
              <li key={idx} onClick={() => handleSelectSuggestion(user)}>
                {user.name} ({user.email})
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
        {users.map((user, idx) => (
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
          <button className="send-btn" onClick={() => setModalStep('sendConfirm')} disabled={disableEmailButton}>📩 전송</button>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;