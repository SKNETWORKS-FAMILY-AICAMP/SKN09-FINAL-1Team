import React, { useEffect, useState } from 'react';
import styles from '../css/sidebar.module.css';

const Sidebar = ({ setSearchParams }) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식의 오늘 날짜
  
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState('전체');

  // 컴포넌트 마운트 시 초기 검색 파라미터 설정
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    setSearchParams({
      keyword,
      startDate,
      endDate,
      status
    });
  };

  const handleDateReset = () => {
    setStartDate('');
    setEndDate(today);
    setSearchParams({
      keyword,
      startDate: '',
      endDate: today,
      status
    });
  };

  return (
    <aside className={styles.sidebar}>
      <h3>필터 검색</h3>

      <label className={styles.filterSection}>📌 상태 필터</label>
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setSearchParams({
            keyword,
            startDate,
            endDate,
            status: e.target.value
          });
        }}
      >
        <option value="전체">전체</option>
        <option value="대기">대기</option>
        <option value="승인">승인</option>
        <option value="수정완료">수정완료</option>
      </select>

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
              setSearchParams({
                keyword,
                startDate: e.target.value,
                endDate,
                status
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
              setSearchParams({
                keyword,
                startDate,
                endDate: e.target.value,
                status
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
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setSearchParams({
            keyword: e.target.value,
            startDate,
            endDate,
            status
          });
        }}
      />

      <div className={styles.statusLegend}>
        <div className={styles.statusLegendTitle}>📊 상태 표시 색상</div>
        <div className={styles.statusItem}>
          <div className={`${styles.statusColor} ${styles.대기}`}></div>
          <span>대기 - 답변 검토중</span>
        </div>
        <div className={styles.statusItem}>
          <div className={`${styles.statusColor} ${styles.승인}`}></div>
          <span>승인 - 답변 확정</span>
        </div>
        <div className={styles.statusItem}>
          <div className={`${styles.statusColor} ${styles.수정완료}`}></div>
          <span>수정완료 - 답변 수정됨</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
