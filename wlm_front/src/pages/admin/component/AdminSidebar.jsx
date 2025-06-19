import React from 'react';
import UserList from './UserList';
import UserSearch from './UserSearch';  // 그대로 사용
import styles from '../css/AdminSidebar.module.css';

const AdminSidebar = ({
  users,
  onSelectUser,
  onDeleteUser,
  searchType,
  searchText,
  onSearchType,
  onSearchText
}) => {
  return (
    <aside className={styles.sidebar}>
      {/* 검색 바: 검색 버튼 제거 */}
      <UserSearch
        searchType={searchType}
        searchText={searchText}
        onSearchType={onSearchType}
        onSearchText={onSearchText}
        // 🔴 onSearch prop 제거 또는 무시됨
      />

      {/* 사용자 리스트 */}
      <UserList
        users={users}
        onSelectUser={onSelectUser}
        onDeleteUser={onDeleteUser}
      />
    </aside>
  );
};

export default AdminSidebar;