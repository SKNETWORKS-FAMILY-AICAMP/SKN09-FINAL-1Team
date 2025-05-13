// src/pages/component/chatbot/component/FilterPanel.jsx
import React from 'react';
import styles from '../css/FilterPanel.module.css';

const FilterPanel = ({
  filterByDate,
  filterByKeyword,
  setFilterByDate,
  setFilterByKeyword,
  searchTerm,
  setSearchTerm,
}) => {
  const handleDateToggle = () => {
    setFilterByDate(!filterByDate);
    if (!filterByDate) setFilterByKeyword(false); // 날짜 체크 시 키워드 해제
  };

  const handleKeywordToggle = () => {
    setFilterByKeyword(!filterByKeyword);
    if (!filterByKeyword) setFilterByDate(false); // 키워드 체크 시 날짜 해제
  };

  return (
    <div className={styles.filterSection}>
      <div>
        <input
          type="checkbox"
          checked={filterByDate}
          onChange={handleDateToggle}
        />
        <label>날짜로 필터</label>
      </div>
      <div>
        <input
          type="checkbox"
          checked={filterByKeyword}
          onChange={handleKeywordToggle}
        />
        <label>키워드로 필터</label>
      </div>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="검색어 입력"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default FilterPanel;
