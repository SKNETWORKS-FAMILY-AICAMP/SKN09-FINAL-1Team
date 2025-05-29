import React, { useState } from 'react';
import styles from '../css/Sidebar.module.css';
import DateSearch from '../../../statics/component/DateSearch';

const Sidebar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch({
      keyword: searchKeyword,
      dateRange: dateRange
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
      dateRange: dateRange
    });
  };

  const handleDateSearch = ({ startDate, endDate }) => {
    // 날짜 유효성 검사
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        alert('종료일은 시작일보다 늦은 날짜여야 합니다.');
        return;
      }
    }

    const newDateRange = startDate && endDate ? { startDate, endDate } : null;
    setDateRange(newDateRange);
    onSearch({
      keyword: searchKeyword,
      dateRange: newDateRange
    });
  };

  const handleDateReset = () => {
    setDateRange(null);
    onSearch({
      keyword: searchKeyword,
      dateRange: null
    });
  };

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>필터 검색</h3>

      <label className={styles.filterSection}>🔍 질문 검색</label>
      <input
        type="text"
        placeholder="검색어 입력..."
        value={searchKeyword}
        onChange={handleKeywordChange}
        onKeyPress={handleKeyPress}
        className={styles.searchInput}
      />

      <DateSearch
        onSearch={handleDateSearch}
        onReset={handleDateReset}
      />
    </aside>
  );
};

export default Sidebar; 