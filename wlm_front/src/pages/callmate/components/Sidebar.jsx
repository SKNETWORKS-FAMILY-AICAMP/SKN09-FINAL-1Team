import React, { useState } from 'react';
import styles from '../css/Sidebar.module.css';
import DateSearch from '../../../statics/component/DateSearch';

const Sidebar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch({
      keyword: searchKeyword,
      type: searchType,
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
      type: searchType,
      dateRange: dateRange
    });
  };

  const handleTypeChange = (e) => {
    setSearchType(e.target.value);
    onSearch({
      keyword: searchKeyword,
      type: e.target.value,
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
      type: searchType,
      dateRange: newDateRange
    });
  };

  const handleDateReset = () => {
    setDateRange(null);
    onSearch({
      keyword: searchKeyword,
      type: searchType,
      dateRange: null
    });
  };

  return (
    <div className={styles.sidebar}>
      <h1 className={styles.title}>Callmate</h1>
      
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <h3 className={styles.searchTitle}>질문 검색</h3>
          <div className={styles.searchTypeContainer}>
            <select 
              className={styles.searchTypeSelect}
              value={searchType}
              onChange={handleTypeChange}
            >
              <option value="all">전체</option>
              <option value="tag">태그</option>
              <option value="question">질문</option>
            </select>
          </div>
          <input
            type="text"
            placeholder={searchType === 'tag' ? '태그로 검색...' : 
                        searchType === 'question' ? '질문으로 검색...' : 
                        '태그 또는 질문으로 검색...'}
            value={searchKeyword}
            onChange={handleKeywordChange}
            onKeyPress={handleKeyPress}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.searchBox}>
          <DateSearch 
            onSearch={handleDateSearch}
            onReset={handleDateReset}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 