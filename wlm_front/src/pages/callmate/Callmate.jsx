import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import styles from './css/Callmate.module.css';

const Callmate = () => {
  // 전체 QA 데이터
  const [qaData, setQaData] = useState([]);
  // 검색 파라미터 상태
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    type: 'all',
    dateRange: null
  });

  // 삭제 핸들러
  const handleDelete = (id) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      setQaData(prevData => prevData.filter(item => item.id !== id));
    }
  };

  // 피드백 추가/수정 핸들러
  const handleFeedback = (id, feedback) => {
    setQaData(prevData =>
      prevData.map(item =>
        item.id === id
          ? { ...item, feedback }
          : item
      )
    );
  };

  // 필터링된 QA 데이터
  const filteredQaData = qaData.filter(qa => {
    // 키워드 검색 필터링
    let matchesKeyword = true;
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase();
      switch (searchParams.type) {
        case 'tag':
          matchesKeyword = qa.tags.some(tag => 
            tag.toLowerCase().includes(keyword)
          );
          break;
        case 'question':
          matchesKeyword = qa.question.toLowerCase().includes(keyword);
          break;
        case 'all':
        default:
          matchesKeyword = qa.tags.some(tag => 
            tag.toLowerCase().includes(keyword)
          ) || qa.question.toLowerCase().includes(keyword);
          break;
      }
    }
    
    // 날짜 검색 필터링
    let matchesDate = true;
    if (searchParams.dateRange) {
      const qaDate = new Date(qa.date);
      const startDate = new Date(searchParams.dateRange.startDate);
      const endDate = new Date(searchParams.dateRange.endDate);
      matchesDate = qaDate >= startDate && qaDate <= endDate;
    }

    return matchesKeyword && matchesDate;
  });

  // 검색 핸들러
  const handleSearch = (params) => {
    setSearchParams(params);
  };

  return (
    <div className={styles.callmateContainer}>
      <div className={styles.callmateWrapper}>
        <Sidebar onSearch={handleSearch} />
        <MainContent 
          qaList={filteredQaData}
          onDelete={handleDelete}
          onFeedback={handleFeedback}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
};

export default Callmate; 