import React, { useState, useEffect } from 'react';
import styles from '../css/UserList.module.css';

const UserList = ({ users = [], onSelectUser, onDeleteUser }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedUsers, setPaginatedUsers] = useState([]);
    const usersPerPage = 5;

    useEffect(() => {
        if (Array.isArray(users)) {
            const startIndex = (currentPage - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            setPaginatedUsers(users.slice(startIndex, endIndex));
        }
    }, [users, currentPage]);

    const totalPages = Math.ceil((users?.length || 0) / usersPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className={styles.userList}>
            <h2 className={styles.listTitle}>사용자 목록</h2>
            <div className={styles.list}>
                {paginatedUsers.map((user) => (
                    <div key={user.emp_no} className={styles.userItem}>
                        <div
                            className={styles.userInfo}
                            onClick={() => onSelectUser(user)}
                        >
                            <span className={styles.userName}>{user.emp_name}</span>
                            <div className={styles.userDetails}>
                                <span className={styles.userId}>{user.emp_code}</span>
                                <span className={styles.userEmail}>{user.emp_email}</span>
                            </div>
                        </div>
                        <button
                            className={styles.deleteButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUser(user.emp_no);
                            }}
                        >
                            삭제
                        </button>
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageButton}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        이전
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        className={styles.pageButton}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserList;


// import React, { useState, useEffect } from 'react';
// import styles from '../css/UserList.module.css';

// const UserList = ({ users, onSelectUser, onDeleteUser }) => {
//     const [currentPage, setCurrentPage] = useState(1);
//     const [paginatedUsers, setPaginatedUsers] = useState([]);
//     const usersPerPage = 5;

//     useEffect(() => {
//         const startIndex = (currentPage - 1) * usersPerPage;
//         const endIndex = startIndex + usersPerPage;
//         setPaginatedUsers(users.slice(startIndex, endIndex));
//     }, [users, currentPage]);

//     const totalPages = Math.ceil(users.length / usersPerPage);

//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//     };

//     return (
//         <div className={styles.userList}>
//             <h2 className={styles.listTitle}>사용자 목록</h2>
//             <div className={styles.list}>
//                 {paginatedUsers.map((user) => (
//                     <div key={user.emp_no} className={styles.userItem}>
//                         <div
//                             className={styles.userInfo}
//                             onClick={() => onSelectUser(user)}
//                         >
//                             <span className={styles.userName}>{user.emp_name}</span>
//                             <div className={styles.userDetails}>
//                                 <span className={styles.userId}>{user.emp_code}</span>
//                                 <span className={styles.userEmail}>{user.emp_email}</span>
//                             </div>
//                         </div>
//                         <button
//                             className={styles.deleteButton}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onDeleteUser(user.emp_no);
//                             }}
//                         >
//                             삭제
//                         </button>
//                     </div>
//                 ))}
//             </div>
//             {totalPages > 1 && (
//                 <div className={styles.pagination}>
//                     <button
//                         className={styles.pageButton}
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={currentPage === 1}
//                     >
//                         이전
//                     </button>
//                     {[...Array(totalPages)].map((_, index) => (
//                         <button
//                             key={index + 1}
//                             className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
//                             onClick={() => handlePageChange(index + 1)}
//                         >
//                             {index + 1}
//                         </button>
//                     ))}
//                     <button
//                         className={styles.pageButton}
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                     >
//                         다음
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default UserList; 