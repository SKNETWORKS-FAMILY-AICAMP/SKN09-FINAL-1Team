import React, { useState } from 'react';
import '../css/sidebar.css';

const Sidebar = ({ setSearchParams }) => {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('전체');

  const handleSearch = () => {
    setSearchParams({ keyword, date, status });
  };

  const handleReset = () => {
    setKeyword('');
    setDate('');
    setStatus('전체');
    setSearchParams({ keyword: '', date: '', status: '전체' });
  };

  return (
    <aside className="sidebar">
      <h3>🔍 질문 검색</h3>
      <input type="text" placeholder="검색어 입력..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <label>📅 날짜 검색</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <label>📌 상태 필터</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="전체">전체</option>
        <option value="대기">대기</option>
        <option value="승인">승인</option>
        <option value="수정">수정완료</option>
      </select>
      <div className="btn-group-row">
        <button className="search-btn" onClick={handleSearch}>검색</button>
        <button className="reset-btn" onClick={handleReset}>초기화</button>
      </div>
    </aside>
  );
};

export default Sidebar;
