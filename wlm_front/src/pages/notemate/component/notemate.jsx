import React, { useState } from 'react';
import '../css/notemate.css';

const Notemate = () => {
  const [filterType, setFilterType] = useState('이름');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [users, setUsers] = useState([
    { name: '이재혁', email: 'dlwogur@naver.com' },
    { name: '이재원', email: 'dlwoaud@gmail.com' },
    { name: '이석재', email: 'asdkenv@gmail.com' },
    { name: '이재희', email: 'qwerqwer@naver.com' },
    { name: '이재상', email: 'qienviona@gmail.com' },
  ]);

  const handleSelectChange = (e) => {
    setFilterType(e.target.value);
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (filterType === '이름') {
      setName(value);
    } else {
      setEmail(value);
    }

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
    if (filterType === '이름') {
      setName(value);
    } else {
      setEmail(value);
    }
    setSuggestions([]);
  };

  const handleRegister = () => {
    if (name.trim() === '' && email.trim() === '') {
      alert('이름 또는 이메일 중 하나 이상 입력하세요.');
      return;
    }

    const newUser = { name, email };
    setUsers([...users, newUser]);
    setName('');
    setEmail('');
    setSuggestions([]);
  };

  const handleDelete = (index) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
  };

  const inputValue = filterType === '이름' ? name : email;

  return (
    <div className="notemate-page">
      <header className="notemate-header">
        <div className="logo-area">🏢 WLBMATE</div>
        <nav className="nav-links">
          <a href="#">🗂 QUERYMATE</a>
          <a href="#">📝 NOTEMATE</a>
          <a href="#">💬 CHATMATE</a>
          <a href="#">📞 CALLMATE</a>
        </nav>
        <div className="header-actions">
          <button className="info-btn">내 정보</button>
          <button className="logout-btn">로그아웃</button>
        </div>
      </header>

      <main className="notemate-main">
        <div className="logo-title">
          <img src="/notemate-logo.png" alt="NOTEMATE" className="logo-img" />
          <h2>NOTEMATE</h2>
        </div>

        <div className="notemate-wrapper">
          <div className="notemate-box">
            <div className="search-bar">
              <select value={filterType} onChange={handleSelectChange}>
                <option>이름</option>
                <option>이메일</option>
              </select>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`${filterType} 입력`}
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

            <div className="user-table">
              <div className="table-header">
                <span>이름</span>
                <span>이메일</span>
                <span></span>
              </div>
              <div className="table-body">
                {users.map((user, index) => (
                  <div className="table-row" key={index}>
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                    <button onClick={() => handleDelete(index)} className="delete-btn">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mic-icon">🎤</div>
          </div>
        </div>
      </main>

      <footer className="notemate-footer">
        <div>DEVELOPER</div>
        <div>
          GITHUB: <a href="https://github.com/SKNETWORKS-FAMILY-AICAMP/SKNO9-FINAL-1Team" target="_blank" rel="noreferrer">https://github.com/SKNETWORKS-FAMILY-AICAMP/SKNO9-FINAL-1Team</a>
        </div>
      </footer>
    </div>
  );
};

export default Notemate;
