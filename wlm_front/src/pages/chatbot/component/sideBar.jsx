// src/pages/component/chatbot/component/Sidebar.jsx

import React, { useState } from 'react';
import styles from '../css/Sidebar.module.css';
import FilterPanel from './FilterPanel';

const mockData = [
  { date: '2025.05.09', keyword: '로그인 문제' },
  { date: '2025.05.09', keyword: 'API 오류' },
  { date: '2025.05.08', keyword: '세션 종료' },
  { date: '2025.05.08', keyword: '디자인 피드백' },
  { date: '2025.05.08', keyword: '빌드 실패' },
];

// 날짜별로 그룹화
const groupByDate = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item.keyword);
    return acc;
  }, {});
};

const Sidebar = () => {
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByKeyword, setFilterByKeyword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const groupedData = groupByDate(mockData);

  const filteredData = Object.entries(groupedData).reduce((acc, [date, keywords]) => {
    // 필터 조건에 따라 date/keyword 비교
    if (filterByDate && !date.includes(searchTerm)) return acc;

    const filteredKeywords = keywords.filter((keyword) => {
      if (filterByKeyword && !keyword.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    if (filteredKeywords.length > 0) {
      acc[date] = filteredKeywords;
    }

    return acc;
  }, {});

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>HISTORY</h2>

      {/* 🔍 필터 컴포넌트 */}
      <FilterPanel
        filterByDate={filterByDate}
        filterByKeyword={filterByKeyword}
        searchTerm={searchTerm}
        setFilterByDate={setFilterByDate}
        setFilterByKeyword={setFilterByKeyword}
        setSearchTerm={setSearchTerm}
      />

      {/* 📅 날짜별 아코디언 */}
      <div className={styles.resultSection}>
        {Object.entries(filteredData).map(([date, keywords], index) => (
          <details key={index} className={styles.details} open>
            <summary className={styles.date}>📅 {date}</summary>
            {keywords.map((keyword, i) => (
              <div key={i} className={styles.item}>💬 {keyword}</div>
            ))}
          </details>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
