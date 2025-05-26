import React, { useState } from 'react';
import styles from '../css/Sidebar.module.css';

const Sidebar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'tag', 'question'

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchKeyword, searchDate, searchType);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handleDateChange = (e) => {
    const formattedDate = formatDate(e.target.value);
    setSearchDate(formattedDate);
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
              onChange={(e) => setSearchType(e.target.value)}
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
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.searchBox}>
          <h3 className={styles.searchTitle}>날짜 검색</h3>
          <input
            type="date"
            onChange={handleDateChange}
            className={styles.searchInput}
          />
        </div>

        <button onClick={handleSearch} className={styles.searchButton}>
          검색
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 