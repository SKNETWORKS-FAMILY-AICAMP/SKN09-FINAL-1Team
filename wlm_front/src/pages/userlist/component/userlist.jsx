import React, { useState, useMemo, useEffect } from 'react';
import '../css/userlist.css';
import { Link } from 'react-router-dom';
import dummyUsers from '../component/dummyusers.jsx'; // 더미 데이터, 추후 DB연결시 파일과 함께 삭제

const UserList = () => {

  // 상태 관리
  const [users, setUsers] = useState(dummyUsers); // 더미 데이터 연결
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 검색 필터링
  const filteredUsers = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return users.filter((user) => {
      if (searchField === 'all') {
        return Object.values(user).some((val) =>
          val.toLowerCase().includes(lowerTerm)
        );
      } else {
        return user[searchField].toLowerCase().includes(lowerTerm);
      }
    });
  }, [users, searchTerm, searchField]);

  // 정렬
  const sortedUsers = useMemo(() => {
    if (!sortKey) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      const aVal = a[sortKey].toLowerCase();
      const bVal = b[sortKey].toLowerCase();
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortKey, sortAsc]);

  // 페이지 분할
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // 페이지 개수
  const maxPageNumbers = 10;
  const currentBlock = Math.floor((currentPage - 1) / maxPageNumbers);
  const blockStart = currentBlock * maxPageNumbers + 1;
  const blockEnd = Math.min(blockStart + maxPageNumbers - 1, totalPages);

  return (
    <div className="user-list-container">
      <h2>사용자 목록</h2>
      <div className="controls">
        <label>
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="all">전체</option>
            <option value="name">이름</option>
            <option value="birth">생년월일</option>
            <option value="id">아이디(사번)</option>
            <option value="email">이메일</option>
            <option value="department">부서</option>
          </select>
        </label>
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <label>
          페이지당 표시:
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
            <option value={10}>10개</option>
            <option value={30}>30개</option>
            <option value={50}>50개</option>
          </select>
        </label>
          <Link to='/createuser' className="create-user-button">
          유저 생성
          </Link>
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name</th>
              <th onClick={() => handleSort('birth')}>Birth</th>
              <th onClick={() => handleSort('id')}>ID</th>
              <th onClick={() => handleSort('email')}>Email</th>
              <th onClick={() => handleSort('department')}>Department</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => (
              <tr key={idx}>
                <td>{user.name}</td>
                <td>{user.birth}</td>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {currentBlock > 0 && (
          <>
            <button onClick={() => setCurrentPage(1)}>{'<<'}</button>
            <button onClick={() => setCurrentPage(blockStart - 1)}>{'<'}</button>
          </>
        )}

        {Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(blockStart + i)}
            className={currentPage === blockStart + i ? 'active' : ''}
          >
            {blockStart + i}
          </button>
        ))}

        {blockEnd < totalPages && (
          <>
            <button onClick={() => setCurrentPage(blockEnd + 1)}>{'>'}</button>
            <button onClick={() => setCurrentPage(totalPages)}>{'>>'}</button>
          </>
        )}
      </div>

    </div>
  );
};

export default UserList;
