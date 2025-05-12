import React, { useState } from 'react';
import '../css/notemate.css';
import querymateImage from '../../images/querymate-image.png';
import notemateImage from '../../images/notemate-image.png';
import logoImage from '../../images/logo-image.png';
import callbotImage from '../../images/callbot-image.png';
import chatbotImage from '../../images/chatbot-image.png';
import beforemeetingImage from '../../images/before-meeting.png';
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
    filterType === '이름' ? setName(value) : setEmail(value);

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
    filterType === '이름' ? setName(value) : setEmail(value);
    setSuggestions([]);
  };

  const handleRegister = () => {
    if (name.trim() === '' && email.trim() === '') {
      alert('이름 또는 이메일 중 하나 이상 입력하세요.');
      return;
    }
    setUsers([...users, { name, email }]);
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
      {/* 헤더 */}
      <header className="notemate-header">
        <div className="logo-area">
          <img src={logoImage} alt="로고" />
          WLBMATE
        </div>

        <nav className="nav-links">
          <a href="#"><img src={querymateImage} alt="querymate" />QUERYMATE</a>
          <a href="#"><img src={notemateImage} alt="notemate" />NOTEMATE</a>
          <a href="#"><img src={chatbotImage} alt="chatbot" />CHATMATE</a>
          <a href="#"><img src={callbotImage} alt="callbot" />CALLMATE</a>
        </nav>

        <div className="header-actions">
          <button>내 정보</button>
          <button>로그아웃</button>
        </div>
      </header>

      {/* 메인 */}
      <main className="notemate-main">
        <div className="logo-title">
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
                    <button onClick={() => handleDelete(index)} className="delete-btn">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mic-icon">
              <img src={beforemeetingImage} alt="mic" />
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="notemate-footer">
        <div>DEVELOPER</div>
        <div>
          GITHUB:{' '}
          <a href="https://github.com/SKNETWORKS-FAMILY-AICAMP/SKNO9-FINAL-1Team" target="_blank" rel="noreferrer">
            https://github.com/SKNETWORKS-FAMILY-AICAMP/SKNO9-FINAL-1Team
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Notemate;
