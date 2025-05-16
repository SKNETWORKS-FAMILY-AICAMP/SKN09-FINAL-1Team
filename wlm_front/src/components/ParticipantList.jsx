import React, { useState } from 'react';
import '../pages/notemate/css/notemate.css';

const ParticipantList = ({ users, isRecording, elapsed, onUpdateUsers }) => {
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

  return (
    <div className="record-left">
      <h3>참가자 목록</h3>

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
        <span>이름</span>
        <span>이메일</span>
        <span>선택</span>
        <span>삭제</span>
      </div>

      {/* 참가자 리스트 */}
      <ul className="user-list">
        {filteredUsers.map((user, idx) => (
          <li key={idx}>
            <span>{user.name}</span>
            <span>{user.email}</span>
            <input
              type="checkbox"
              checked={user.selected || false}
              onChange={() => handleCheck(idx)}
            />
            <button onClick={() => handleDelete(idx)}>✕</button>
          </li>
        ))}
      </ul>

      {/* 하단 버튼 */}
      {!isRecording && elapsed > 0 && (
        <div className="participant-actions">
          <button className="select-all-btn" onClick={handleSelectAll}>전체 선택</button>
          <button className="send-btn">📩 전송</button>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
