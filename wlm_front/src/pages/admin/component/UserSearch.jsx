import React from 'react';
import styles from '../css/UserSearch.module.css';

const UserSearch = ({ searchType, searchText, onSearchType, onSearchText }) => {
  return (
    <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
      <select
        className={styles.searchSelect}
        value={searchType}
        onChange={(e) => onSearchType(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="emp_name">이름</option>
        <option value="emp_code">사번</option>
        <option value="emp_email">이메일</option>
      </select>
      <input
        className={styles.searchInput}
        type="text"
        value={searchText}
        onChange={(e) => onSearchText(e.target.value)}  // 입력 시 자동 검색
        placeholder="검색어 입력"
      />
      {/* 🔴 버튼 제거됨 */}
    </form>
  );
};

export default UserSearch;