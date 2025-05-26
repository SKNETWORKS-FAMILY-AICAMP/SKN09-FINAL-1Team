import React from 'react';
import styles from '../css/UserSearch.module.css';

const UserSearch = ({
    searchType,
    searchText,
    onSearchType,
    onSearchText,
    onSearch
}) => {
    return (
        <form className={styles.searchForm} onSubmit={onSearch}>
            <select
                className={styles.searchSelect}
                value={searchType}
                onChange={(e) => onSearchType(e.target.value)}
            >
                <option value="all">전체</option>
                <option value="emp_code">사원번호</option>
                <option value="emp_name">이름</option>
                <option value="emp_email">이메일</option>
            </select>
            <input
                className={styles.searchInput}
                type="text"
                placeholder="검색어 입력"
                value={searchText}
                onChange={(e) => onSearchText(e.target.value)}
            />
            <button className={styles.searchButton} type="submit">
                검색
            </button>
        </form>
    );
};

export default UserSearch; 