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
  startDate,
  endDate,
  setStartDate,
  setEndDate,
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
      <div className={styles.filterCheckRow}>
        <div>
          <input
            type="checkbox"
            checked={filterByDate}
            onChange={handleDateToggle}
          />
          <label>날짜 검색</label>
        </div>
        <div>
          <input
            type="checkbox"
            checked={filterByKeyword}
            onChange={handleKeywordToggle}
          />
          <label>키워드 검색</label>
        </div>
      </div>
      {filterByDate && (
        <div className={styles.dateInputCol}>
          <label className={styles.dateLabel}>시작 날짜</label>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <label className={styles.dateLabel} style={{ marginTop: '0.5rem' }}>끝 날짜</label>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      )}
      {filterByKeyword && (
        <input
          className={styles.searchInput}
          type="text"
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
    </div>
  );
};

export default FilterPanel;
