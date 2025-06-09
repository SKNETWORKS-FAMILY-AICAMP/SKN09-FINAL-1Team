import React, { useState } from 'react';
import styles from '../css/SideBar.module.css';
import FilterPanel from './FilterPanel';

const mockData = [
  { date: '2025.05.09', keyword: '로그인 문제' },
  { date: '2025.05.09', keyword: 'API 오류' },
  { date: '2025.05.08', keyword: '세션 종료' },
  { date: '2025.05.08', keyword: '디자인 피드백' },
  { date: '2025.05.08', keyword: '빌드 실패' },
];

const groupByDate = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item.keyword);
    return acc;
  }, {});
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByKeyword, setFilterByKeyword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const groupedData = groupByDate(mockData);

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '←' : '→'}
      </button>
      <div className={styles.sidebar + (!isOpen ? ` ${styles.closed}` : '')}>
        <h2 className={styles.title}>HISTORY</h2>

        <FilterPanel
          filterByDate={filterByDate}
          filterByKeyword={filterByKeyword}
          setFilterByDate={setFilterByDate}
          setFilterByKeyword={setFilterByKeyword}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <div className={styles.divider} />

        <div className={styles.resultSection}>
          {Object.entries(groupedData).map(([date, keywords], index) => (
            <details key={index} className={styles.details} open>
              <summary className={styles.date}> {date}</summary>
              {keywords.map((keyword, i) => (
                <div key={i} className={styles.item}> {keyword}</div>
              ))}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
