import React, { useState, useEffect } from 'react';
import AdminHeader from './component/AdminHeader';
import AdminSidebar from './component/AdminSidebar';
import AdminMain from './component/AdminMain';
import styles from './admin.module.css';

function AdminBase() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchType, setSearchType] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        setUsers([
            { emp_no: 1, emp_name: "홍길동", emp_code: "A001", emp_email: "hong1@example.com", emp_birth_date: "1990-01-01", createdAt: "2024-01-01", role: 0, password: "1234" },
            { emp_no: 2, emp_name: "김철수", emp_code: "A002", emp_email: "kim2@example.com", emp_birth_date: "1992-02-02", createdAt: "2024-01-02", role: 1, password: "5678" },
            { emp_no: 3, emp_name: "이영희", emp_code: "A003", emp_email: "lee3@example.com", emp_birth_date: "1993-03-03", createdAt: "2024-01-03", role: 0, password: "9012" },
            { emp_no: 4, emp_name: "박민수", emp_code: "A004", emp_email: "park4@example.com", emp_birth_date: "1994-04-04", createdAt: "2024-01-04", role: 1, password: "3456" },
            { emp_no: 5, emp_name: "최지우", emp_code: "A005", emp_email: "choi5@example.com", emp_birth_date: "1995-05-05", createdAt: "2024-01-05", role: 0, password: "7890" },
        ]);
    }, []);

    useEffect(() => {
        let result = users;
        if (searchText.trim() !== '') {
            const text = searchText.trim().toLowerCase();
            if (searchType === 'emp_code') {
                result = users.filter(u => u.emp_code.toLowerCase().includes(text));
            } else if (searchType === 'emp_name') {
                result = users.filter(u => u.emp_name.toLowerCase().includes(text));
            } else if (searchType === 'emp_email') {
                result = users.filter(u => u.emp_email.toLowerCase().includes(text));
            } else {
                result = users.filter(u =>
                    u.emp_name.toLowerCase().includes(text) ||
                    u.emp_code.toLowerCase().includes(text) ||
                    u.emp_email.toLowerCase().includes(text)
                );
            }
        }
        setFilteredUsers(result);
    }, [users, searchText, searchType]);

    const handleCreateUser = (userData) => {
        setUsers(prev => [
            ...prev,
            {
                ...userData,
                emp_no: prev.length + 1,
                createdAt: new Date().toISOString().slice(0, 10),
            },
        ]);
        setShowCreateForm(false);
    };

    const handleDeleteUser = (emp_no) => {
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            setUsers(prev => prev.filter(user => user.emp_no !== emp_no));
            setSelectedUser(null);
        }
    };

    const handleResetPassword = (emp_no) => {
        const user = users.find(u => u.emp_no === emp_no);
        if (user) {
            const oldPassword = user.password;
            const newPassword = '1234';
            console.log('비밀번호 초기화 정보:', {
                사용자: user.emp_name,
                이전_비밀번호: oldPassword,
                새_비밀번호: newPassword
            });
            
            setUsers(prev => prev.map(u => {
                if (u.emp_no === emp_no) {
                    return { ...u, password: newPassword };
                }
                return u;
            }));
            
            alert(`비밀번호가 '1234'로 초기화되었습니다.`);
        }
    };

    const handleSearchType = (type) => setSearchType(type);
    const handleSearchText = (text) => setSearchText(text);
    const handleSearch = (e) => { e.preventDefault(); setSearchText(searchText); };

    return (
        <div className={styles.adminContainer}>
            <AdminHeader onCreateClick={() => { setShowCreateForm(true); setSelectedUser(null); }} />
            <div className={styles.content}>
                <AdminSidebar
                    users={filteredUsers.length > 0 || searchText ? filteredUsers : users}
                    onSelectUser={(user) => { setSelectedUser(user); setShowCreateForm(false); }}
                    onDeleteUser={handleDeleteUser}
                    searchType={searchType}
                    searchText={searchText}
                    onSearchType={handleSearchType}
                    onSearchText={handleSearchText}
                    onSearch={handleSearch}
                />
                <AdminMain
                    showCreateForm={showCreateForm}
                    selectedUser={selectedUser}
                    onCreateUser={handleCreateUser}
                    onCancelCreate={() => setShowCreateForm(false)}
                    onCloseDetail={() => setSelectedUser(null)}
                    onResetPassword={handleResetPassword}
                />
            </div>
        </div>
    );
}

export default AdminBase; 