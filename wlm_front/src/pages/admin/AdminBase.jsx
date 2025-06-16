// import React, { useState, useEffect } from 'react';
// import AdminHeader from './component/AdminHeader';
// import AdminSidebar from './component/AdminSidebar';
// import AdminMain from './component/AdminMain';
// import styles from './admin.module.css';
// import axios from 'axios';

// function AdminBase() {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [showCreateForm, setShowCreateForm] = useState(false);
//     const [searchType, setSearchType] = useState('all');
//     const [searchText, setSearchText] = useState('');
//     const [filteredUsers, setFilteredUsers] = useState([]);

//     // 사원 목록 불러오기
//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await axios.get('http://localhost:8000/api/employees', {
//                     withCredentials: true,  // 세션 쿠키 전달
//                 });
//                 setUsers(response.data.data);
//             } catch (error) {
//                 console.error('사원 목록 불러오기 실패:', error);
//             }
//         };

//         fetchUsers();
//     }, []);

//     // 검색 필터링
//     useEffect(() => {
//         let result = users;
//         if (searchText.trim() !== '') {
//             const text = searchText.trim().toLowerCase();
//             if (searchType === 'emp_code') {
//                 result = users.filter(u => u.emp_code.toLowerCase().includes(text));
//             } else if (searchType === 'emp_name') {
//                 result = users.filter(u => u.emp_name.toLowerCase().includes(text));
//             } else if (searchType === 'emp_email') {
//                 result = users.filter(u => u.emp_email.toLowerCase().includes(text));
//             } else {
//                 result = users.filter(u =>
//                     u.emp_name.toLowerCase().includes(text) ||
//                     u.emp_code.toLowerCase().includes(text) ||
//                     u.emp_email.toLowerCase().includes(text)
//                 );
//             }
//         }
//         setFilteredUsers(result);
//     }, [users, searchText, searchType]);

//     const handleCreateUser = async (userData) => {
//   console.log('전송 데이터:', userData);
//   try {
//     const response = await axios.post('http://localhost:8000/api/employees', userData, {
//       withCredentials: true,
//     });
//     setUsers(prev => [...prev, response.data]);
//     setShowCreateForm(false);
//   } catch (error) {
//     console.error('사원 생성 실패:', error.response?.data || error.message);
//     alert('사원 생성에 실패했습니다.');
//   }
// };

//     const handleDeleteUser = async (emp_no) => {
//         if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
//             try {
//                 await axios.delete(`http://localhost:8000/api/employees/${emp_no}`, {
//                     withCredentials: true,
//                 });
//                 setUsers(prev => prev.filter(user => user.emp_no !== emp_no));
//                 setSelectedUser(null);
//             } catch (error) {
//                 console.error('삭제 실패:', error);
//                 alert('삭제 중 오류가 발생했습니다.');
//             }
//         }
//     };

//     // 🔹 비밀번호 초기화
//     const handleResetPassword = async (emp_no) => {
//         const user = users.find(u => u.emp_no === emp_no);
//         if (user) {
//             try {
//                 await axios.put(`http://localhost:8000/api/employees/${emp_no}/reset-password`, {
//                     newPassword:"1234",
//                 }, {
//                     withCredentials: true,
//                 });

//                 alert('비밀번호가 "1234"로 초기화되었습니다.');
//             } catch (error) {
//                 console.error('비밀번호 초기화 실패:', error);
//                 alert('비밀번호 초기화에 실패했습니다.');
//             }
//         }
//     };

//     const handleSearchType = (type) => setSearchType(type);
//     const handleSearchText = (text) => setSearchText(text);
//     const handleSearch = (e) => { e.preventDefault(); setSearchText(searchText); };

//     return (
//         <div className={styles.adminContainer}>
//             <AdminHeader onCreateClick={() => { setShowCreateForm(true); setSelectedUser(null); }} />
//             <div className={styles.content}>
//                 <AdminSidebar
//                     users={filteredUsers.length > 0 || searchText ? filteredUsers : users}
//                     onSelectUser={(user) => { setSelectedUser(user); setShowCreateForm(false); }}
//                     onDeleteUser={handleDeleteUser}
//                     searchType={searchType}
//                     searchText={searchText}
//                     onSearchType={handleSearchType}
//                     onSearchText={handleSearchText}
//                     onSearch={handleSearch}
//                 />
//                 <AdminMain
//                     showCreateForm={showCreateForm}
//                     selectedUser={selectedUser}
//                     onCreateUser={handleCreateUser}
//                     onCancelCreate={() => setShowCreateForm(false)}
//                     onCloseDetail={() => setSelectedUser(null)}
//                     onResetPassword={handleResetPassword}
//                 />
//             </div>
//         </div>
//     );
// }

// export default AdminBase;


// import React, { useState, useEffect, useCallback } from 'react';
// import AdminHeader from './component/AdminHeader';
// import AdminSidebar from './component/AdminSidebar';
// import AdminMain from './component/AdminMain';
// import styles from './admin.module.css';
// import axios from 'axios';

// function AdminBase() {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [showCreateForm, setShowCreateForm] = useState(false);
//     const [searchType, setSearchType] = useState('all');
//     const [searchText, setSearchText] = useState('');
//     const [filteredUsers, setFilteredUsers] = useState([]);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await axios.get('http://localhost:8000/api/employees', {
//                     withCredentials: true,
//                 });
//                 if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
//                     const formattedUsers = response.data.data.map(user => ({
//                         ...user,
//                         emp_birth_date: user.emp_birth_date ? new Date(user.emp_birth_date).toISOString().split('T')[0] : '',
//                         emp_create_dt: user.emp_create_dt ? new Date(user.emp_create_dt).toISOString().split('T')[0] : ''
//                     }));
//                     setUsers(formattedUsers);
//                 } else {
//                     alert('사원 목록을 불러오는 데 실패했습니다: 서버 응답 형식 오류');
//                 }
//             } catch (error) {
//                 alert('사원 목록을 불러오는 데 실패했습니다.');
//             }
//         };

//         fetchUsers();
//     }, []); 
    
//     useEffect(() => {
//         let result = users;
//         if (searchText.trim() !== '') {
//             const text = searchText.trim().toLowerCase();
//             if (searchType === 'emp_code') {
//                 result = users.filter(u => u.emp_code && u.emp_code.toLowerCase().includes(text));
//             } else if (searchType === 'emp_name') {
//                 result = users.filter(u => u.emp_name && u.emp_name.toLowerCase().includes(text));
//             } else if (searchType === 'emp_email') {
//                 result = users.filter(u => u.emp_email && u.emp_email.toLowerCase().includes(text));
//             } else {
//                 result = users.filter(u =>
//                     (u.emp_name && u.emp_name.toLowerCase().includes(text)) ||
//                     (u.emp_code && u.emp_code.toLowerCase().includes(text)) ||
//                     (u.emp_email && u.emp_email.toLowerCase().includes(text))
//                 );
//             }
//         }
//         setFilteredUsers(result);
//     }, [users, searchText, searchType]);

//     const handleCreateUser = useCallback(async (newUserDataFromForm) => {
//         const dataToSend = { ...newUserDataFromForm };
//         if (dataToSend.emp_no) {
//             delete dataToSend.emp_no; 
//         }
        
//         console.log('클라이언트에서 서버로 전송할 데이터:', dataToSend);

//         try {
//             const response = await axios.post('http://localhost:8000/api/employees', dataToSend, {
//                 withCredentials: true,
//                 headers: {
//                     'Content-Type': 'application/json' 
//                 }
//             });
//             console.log('서버로부터 받은 응답 데이터:', response.data);

//             if (response.data && response.data.emp_no) {
//                 const completeNewUser = {
//                     ...newUserDataFromForm, 
//                     emp_no: response.data.emp_no, 
//                     emp_create_dt: new Date().toISOString().split('T')[0] 
//                 };
                
//                 setUsers(prev => [...prev, completeNewUser]);
                
//                 setShowCreateForm(false);
//                 alert('사용자가 성공적으로 등록되었습니다!');
//             } else {
//                 alert('사용자 등록은 성공했으나, 데이터 처리 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
//             }
//         } catch (error) {
//             const errorMessage = error.response?.data?.detail
//                                ? (Array.isArray(error.response.data.detail) 
//                                    ? error.response.data.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join('\n')
//                                    : JSON.stringify(error.response.data.detail))
//                                : error.message; 
//             alert('사원 생성에 실패했습니다: ' + errorMessage);
//         }
//     }, [setUsers, setShowCreateForm]);


//     const handleDeleteUser = async (emp_no) => {
//         if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
//             try {
//                 await axios.delete(`http://localhost:8000/api/employees/${emp_no}`, {
//                     withCredentials: true,
//                 });
//                 setUsers(prev => prev.filter(user => user.emp_no !== emp_no));
//                 setSelectedUser(null);
//                 alert('사용자가 성공적으로 삭제되었습니다.');
//             } catch (error) {
//                 alert('삭제 중 오류가 발생했습니다.');
//             }
//         }
//     };

//     const handleResetPassword = async (emp_no) => {
//         const user = users.find(u => u.emp_no === emp_no);
//         if (user) {
//             if (window.confirm(`${user.emp_name} (${user.emp_code}) 사원의 비밀번호를 "1234"로 초기화하시겠습니까?`)) {
//                 try {
//                     await axios.put(`http://localhost:8000/api/employees/${emp_no}/reset-password`, {
//                         newPassword: "1234",
//                     }, {
//                         withCredentials: true,
//                     });
//                     alert(`${user.emp_name} 사원의 비밀번호가 "1234"로 초기화되었습니다.`);
//                 } catch (error) {
//                     alert('비밀번호 초기화에 실패했습니다.');
//                 }
//             }
//         }
//     };

//     const handleSearchType = (type) => setSearchType(type);
//     const handleSearchText = (text) => setSearchText(text);
//     const handleSearch = (e) => {
//         e.preventDefault(); 
//     };

//     return (
//         <div className={styles.adminContainer}>
//             <AdminHeader onCreateClick={() => { setShowCreateForm(true); setSelectedUser(null); }} />
//             <div className={styles.content}>
//                 <AdminSidebar
//                     users={filteredUsers.length > 0 || searchText ? filteredUsers : users}
//                     onSelectUser={(user) => { setSelectedUser(user); setShowCreateForm(false); }}
//                     onDeleteUser={handleDeleteUser}
//                     searchType={searchType}
//                     searchText={searchText}
//                     onSearchType={handleSearchType}
//                     onSearchText={handleSearchText}
//                     onSearch={handleSearch}
//                     onResetPassword={handleResetPassword}
//                 />
//                 <AdminMain
//                     showCreateForm={showCreateForm}
//                     selectedUser={selectedUser}
//                     onCreateUser={handleCreateUser}
//                     onCancelCreate={() => setShowCreateForm(false)}
//                     onCloseDetail={() => setSelectedUser(null)}
//                     onResetPassword={handleResetPassword}
//                 />
//             </div>
//         </div>
//     );
// }

// export default AdminBase;
import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from './component/AdminHeader';
import AdminSidebar from './component/AdminSidebar';
import AdminMain from './component/AdminMain';
import styles from './admin.module.css';
import axios from 'axios';

function AdminBase() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
     [showCreateForm, setShowCreateForm] = useState(false);
    const [searchType, setSearchType] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/employees', {
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
