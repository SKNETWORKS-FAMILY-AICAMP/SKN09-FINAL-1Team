import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from './component/AdminHeader';
import AdminSidebar from './component/AdminSidebar';
import AdminMain from './component/AdminMain';
import styles from './admin.module.css';
import axios from 'axios';

function AdminBase() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchType, setSearchType] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/employees_general', {
                    withCredentials: true,
                });
                if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
                    const formattedUsers = response.data.data.map(user => ({
                        ...user,
                        emp_birth_date: user.emp_birth_date ? new Date(user.emp_birth_date).toISOString().split('T')[0] : '',
                        emp_create_dt: user.emp_create_dt ? new Date(user.emp_create_dt).toISOString().split('T')[0] : ''
                    }));
                    setUsers(formattedUsers);
                } else {
                    alert('사원 목록을 불러오는 데 실패했습니다: 서버 응답 형식 오류');
                }
            } catch (error) {
                alert('사원 목록을 불러오는 데 실패했습니다.');
            }
        };
        fetchUsers();
    }, []); 
    
    useEffect(() => {
        let result = users;
        if (searchText.trim() !== '') {
            const text = searchText.trim().toLowerCase();
            if (searchType === 'emp_code') {
                result = users.filter(u => u.emp_code && u.emp_code.toLowerCase().includes(text));
            } else if (searchType === 'emp_name') {
                result = users.filter(u => u.emp_name && u.emp_name.toLowerCase().includes(text));
            } else if (searchType === 'emp_email') {
                result = users.filter(u => u.emp_email && u.emp_email.toLowerCase().includes(text));
            } else {
                result = users.filter(u =>
                    (u.emp_name && u.emp_name.toLowerCase().includes(text)) ||
                    (u.emp_code && u.emp_code.toLowerCase().includes(text)) ||
                    (u.emp_email && u.emp_email.toLowerCase().includes(text))
                );
            }
        }
        setFilteredUsers(result);
    }, [users, searchText, searchType]);

    
    const handleCreateUser = useCallback((newUser) => {
        setUsers(prev => [...prev, newUser]);
        setShowCreateForm(false);
    }, [setUsers, setShowCreateForm]);

    const handleDeleteUser = async (emp_no) => {
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/api/employees/${emp_no}`, {
                    withCredentials: true,
                });
                setUsers(prev => prev.filter(user => user.emp_no !== emp_no));
                setSelectedUser(null);
                alert('사용자가 성공적으로 삭제되었습니다.');
            } catch (error) {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleResetPassword = async (emp_no) => {
        const user = users.find(u => u.emp_no === emp_no);
        if (user) {
            if (window.confirm(`${user.emp_name} (${user.emp_code}) 사원의 비밀번호를 "1234"로 초기화하시겠습니까?`)) {
                try {
                    await axios.put(`/api/employees/${emp_no}/reset-password`, {
                        newPassword: "1234",
                    }, {
                        withCredentials: true,
                    });
                    alert(`${user.emp_name} 사원의 비밀번호가 "1234"로 초기화되었습니다.`);
                } catch (error) {
                    alert('비밀번호 초기화에 실패했습니다.');
                }
            }
        }
    };

    const handleSearchType = (type) => setSearchType(type);
    const handleSearchText = (text) => setSearchText(text);
    const handleSearch = (e) => {
        e.preventDefault(); 
    };

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
                    onResetPassword={handleResetPassword}
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
