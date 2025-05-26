import React, { useState } from 'react';
import '../css/sidebar.css';

const Sidebar = ({ setSearchParams }) => {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [sort, setSort] = useState('최근순');

  const handleSearch = () => {
    setSearchParams({ keyword, date, sort });
  };

  const handleReset = () => {
    setKeyword('');
    setDate('');
    setSort('최근순');
    setSearchParams({ keyword: '', date: '', sort: '최근순' });
  };

  return (
    <aside className="sidebar">
      <h3>🔍 질문 검색</h3>
      <input
        type="text"
        placeholder="검색어 입력..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <label>📅 날짜 검색</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <label>↕ 정렬 및 필터</label>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="오래된순">오래된순</option>
        <option value="최근순">최근순</option>
      </select>


      <div className="btn-group-row">
        <button className="btn search-btn" onClick={handleSearch}>검색</button>
        <button className="btn reset-btn" onClick={handleReset} title="초기화">
          초기화
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
