import React, { useState } from 'react';
import styles from '../css/SideBar.module.css';

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

  const handleSearch = () => {
    // 실제 검색 기능은 여기에 구현할 수 있습니다.
    // 현재는 디자인과 레이아웃만 반영된 상태입니다.
    console.log('검색 clicked', { filterByDate, filterByKeyword, startDate, endDate, searchTerm });
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '←' : '→'}
      </button>

      <div className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
        {/* --- 제목 부분 --- */}
        <h2 className={styles.title}>HISTORY</h2>

        {/* --- 필터 & 검색 박스 --- */}
        <div className={styles.searchArea}>
          <div className={styles.checkboxRow}>
            <label>
              <input
                type="checkbox"
                checked={filterByDate}
                onChange={() => setFilterByDate(!filterByDate)}
              />
              날짜로 필터
            </label>
            <label>
              <input
                type="checkbox"
                checked={filterByKeyword}
                onChange={() => setFilterByKeyword(!filterByKeyword)}
              />
              키워드로 필터
            </label>
          </div>
          <button className={styles.searchBtn} onClick={handleSearch}>
            검색
          </button>
        </div>

        {/* --- 구분선 --- */}
        <div className={styles.divider} />

        {/* --- 결과 목록 --- */}
        <div className={styles.resultSection}>
          {Object.entries(groupedData).map(([date, keywords], index) => (
            <details key={index} className={styles.details} open>
              <summary className={styles.date}>📅 {date}</summary>
              {keywords.map((keyword, i) => (
                <div key={i} className={styles.item}>
                  💬 {keyword}
                </div>
              ))}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
