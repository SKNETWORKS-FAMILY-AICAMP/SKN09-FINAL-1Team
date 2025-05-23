import React from 'react';
import '../css/sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>🔍 질문 검색</h3>
      <input type="text" placeholder="검색어 입력..." />
      <div className="filter-section">
        <label>날짜 검색</label>
        <input type="date" />
        <label>정렬 및 필터</label>
        <select>
          <option>최근순</option>
          <option>오래된순</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;
