import React, { useState } from 'react';
import styles from '../css/Sidebar.module.css';

const Sidebar = ({ onSearch }) => {
  const today = new Date().toISOString().split('T')[0];
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);

  const handleSearch = () => {
    onSearch({
      keyword: searchKeyword,
      startDate,
      endDate
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleKeywordChange = (e) => {
    setSearchKeyword(e.target.value);
    onSearch({
      keyword: e.target.value,
      startDate,
      endDate
    });
  };

  const handleDateReset = () => {
    setStartDate('');
    setEndDate(today);
    onSearch({
      keyword: searchKeyword,
      startDate: '',
      endDate: today
    });
  };

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>필터 검색</h3>

      <div className={styles.filterHeaderRow}>
        <label className={styles.filterSection}>📅 날짜 필터</label>
        <button className={styles.smallResetBtn} onClick={handleDateReset}>
          초기화
        </button>
      </div>
      <div className={styles.dateInputContainer}>
        <div className={styles.dateInputCol}>
          <label className={styles.dateLabel}>시작 날짜</label>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              onSearch({
                keyword: searchKeyword,
                startDate: e.target.value,
                endDate
              });
            }}
            max={endDate}
          />
        </div>
        <div className={styles.dateInputCol}>
          <label className={styles.dateLabel}>끝 날짜</label>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              onSearch({
                keyword: searchKeyword,
                startDate,
                endDate: e.target.value
              });
            }}
            min={startDate || '1900-01-01'}
            max={today}
          />
        </div>
      </div>

      <label className={styles.filterSection}>🔍 질문 검색</label>
      <input
        type="text"
        placeholder="검색어 입력..."
        value={searchKeyword}
        onChange={handleKeywordChange}
        onKeyPress={handleKeyPress}
        className={styles.searchInput}
      />
    </aside>
  );
};

export default Sidebar;