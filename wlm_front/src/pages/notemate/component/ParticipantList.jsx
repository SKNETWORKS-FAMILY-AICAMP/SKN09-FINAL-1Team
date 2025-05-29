import React, { useState, useEffect } from 'react';
import '../css/notemate.css';
import '../css/ParticipantList.css';

const ParticipantList = ({
  users,
  allUsers,
  isRecording,
  onUpdateUsers,
  setModalStep,
  disableEmailButton,
  hostName,  // 로그인 계정에서 가져오는 주최자 이름
  step
}) => {
  const [filterType, setFilterType] = useState('이름');
  const [filter, setFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');

  // 현재 시간 자동 적용
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    setMeetingDate(formattedDate);
  }, []);

  // 로그인 사용자(주최자) 강제 등록
  useEffect(() => {
    if (hostName) {
      const existingHost = users.find(user => user.name === hostName);
      if (!existingHost) {
        onUpdateUsers([{ name: hostName, email: '', selected: false }, ...users]);
      }
    }
  }, [hostName, users, onUpdateUsers]);

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
        <button className="register-btn" onClick={handleRegister}>추가</button>
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


      {/* 참가자 리스트 */}
      <ul className="user-list">
        <li>
          <span>이름</span>
          <span>이메일</span>
          <span>삭제</span>
        </li>
        {users.map((user, idx) => (
          <li key={idx}>
            <span>{user.name}</span>
            <span>{user.email}</span>
            <button onClick={() => handleDelete(idx)}>✕</button>
          </li>
        ))}
      </ul>

      {/* 하단 버튼 */}
      <div className="participant-actions">
        <button
          className="send-btn"
          onClick={() => setModalStep('sendConfirm')}
          disabled={step !== 'summarized'}
        >📩 전송</button>
      </div>
    </div>
  );
};

export default ParticipantList;
