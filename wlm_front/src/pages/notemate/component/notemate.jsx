import React, { useState } from 'react';
import '../css/notemate.css';
import Header from '../../../statics/component/header.jsx';
import Footer from '../../../statics/component/footer.jsx';
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

  const [isRecording, setIsRecording] = useState(false);
  const [modalStep, setModalStep] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

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

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startMeeting = () => {
    const now = Date.now();
    setIsRecording(true);

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
    setTimerInterval(interval);
  };

  const stopMeeting = () => {
    clearInterval(timerInterval);
    setIsRecording(false);
    setElapsed(0);
    setTimerInterval(null);
  };

  return (
    <div className="notemate-page">
      <Header />

      <main className="notemate-main">
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
              <button
                className="mic-button"
                onClick={() =>
                  isRecording ? setModalStep('stopConfirm') : setModalStep('startConfirm')
                }
              >
                {isRecording && <div className="mic-pulse" />}
                <img src={beforemeetingImage} alt="mic" />
              </button>

              {isRecording && (
                <div className="timer-text">⏱ {formatTime(elapsed)}</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {modalStep && (
        <div className="custom-modal">
          {modalStep === 'startConfirm' && (
            <>
              <p>
                🟡 회의를 시작하겠습니까?<br />
                <small>(강제 종료 등 비정상적으로 종료되면 회의가 종료되지 않습니다.)</small>
              </p>
              <button onClick={() => setModalStep('startNotice')}>네</button>
              <button onClick={() => setModalStep(null)}>아니요</button>
            </>
          )}
          {modalStep === 'startNotice' && (
            <>
              <p>🟢 회의를 시작합니다.</p>
              <button onClick={() => {
                startMeeting();
                setModalStep(null);
              }}>확인</button>
            </>
          )}
          {modalStep === 'stopConfirm' && (
            <>
              <p>🛑 회의를 종료하시겠습니까?</p>
              <button onClick={() => setModalStep('stopNotice')}>네</button>
              <button onClick={() => setModalStep(null)}>아니요</button>
            </>
          )}
          {modalStep === 'stopNotice' && (
            <>
              <p>회의를 종료합니다.</p>
              <button onClick={() => {
                stopMeeting();
                setModalStep(null);
              }}>확인</button>
            </>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Notemate;
