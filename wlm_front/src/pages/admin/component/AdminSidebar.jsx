import React from 'react';
import UserList from './UserList.jsx';
import UserSearch from './UserSearch.jsx';
import styles from '../css/AdminSidebar.module.css';

const AdminSidebar = ({
    users,
    onSelectUser,
    onDeleteUser,
    searchType,
    searchText,
    onSearchType,
    onSearchText,
    onSearch
}) => {
    return (
        <aside className={styles.sidebar}>
            <UserSearch
                searchType={searchType}
                searchText={searchText}
                onSearchType={onSearchType}
                onSearchText={onSearchText}
                onSearch={onSearch}
            />
            <UserList
                users={users}
                onSelectUser={onSelectUser}
                onDeleteUser={onDeleteUser}
            />
        </aside>
    );
};

export default AdminSidebar; 