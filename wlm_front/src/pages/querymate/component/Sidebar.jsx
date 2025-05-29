import React, { useState } from 'react';
import '../css/sidebar.css';
import styles from '../css/sidebar.module.css';
import DateSearch from '../../../statics/component/DateSearch';

const Sidebar = ({ setSearchParams }) => {
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState('전체');

  const handleDateSearch = ({ startDate, endDate }) => {
    console.log('Date Search:', { startDate, endDate }); // 디버깅용
    const newDateRange = { startDate, endDate };
    setDateRange(newDateRange);
    setSearchParams({
      keyword,
      dateRange: newDateRange,
      status
    });
  };

  const handleDateReset = () => {
    setDateRange(null);
    setSearchParams({
      keyword,
      dateRange: null,
      status
    });
  };

  return (
    <aside className="sidebar">
      <h3>필터 검색</h3>
      
      <label>📌 상태 필터</label>
      <select 
        value={status} 
        onChange={(e) => {
          setStatus(e.target.value);
          setSearchParams({
            keyword,
            dateRange,
            status: e.target.value
          });
        }}
      >
        <option value="전체">전체</option>
        <option value="대기">대기</option>
        <option value="승인">승인</option>
        <option value="수정완료">수정완료</option>
      </select>

      <label>🔍 질문 검색</label>
      <input 
        type="text" 
        placeholder="검색어 입력..." 
        value={keyword} 
        onChange={(e) => {
          setKeyword(e.target.value);
          setSearchParams({
            keyword: e.target.value,
            dateRange,
            status
          });
        }} 
      />
      
      <DateSearch 
        onSearch={handleDateSearch}
        onReset={handleDateReset}
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
