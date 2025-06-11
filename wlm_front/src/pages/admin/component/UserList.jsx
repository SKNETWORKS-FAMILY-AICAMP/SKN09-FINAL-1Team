// import React, { useState, useEffect } from 'react';
// import styles from '../css/UserList.module.css';

// const UserList = ({ users = [], onSelectUser, onDeleteUser }) => {
//     const [currentPage, setCurrentPage] = useState(1);
//     const [paginatedUsers, setPaginatedUsers] = useState([]);
//     const usersPerPage = 5;

//     useEffect(() => {
//         if (Array.isArray(users)) {
//             const startIndex = (currentPage - 1) * usersPerPage;
//             const endIndex = startIndex + usersPerPage;
//             setPaginatedUsers(users.slice(startIndex, endIndex));
//         }
//     }, [users, currentPage]);

//     const totalPages = Math.ceil((users?.length || 0) / usersPerPage);

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

//                     {(() => {
//                         const maxVisible = 5;
//                         let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//                         let endPage = startPage + maxVisible - 1;

//                         if (endPage > totalPages) {
//                             endPage = totalPages;
//                             startPage = Math.max(1, endPage - maxVisible + 1);
//                         }

//                         return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
//                             const page = startPage + i;
//                             return (
//                                 <button
//                                     key={page}
//                                     className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
//                                     onClick={() => handlePageChange(page)}
//                                 >
//                                     {page}
//                                 </button>
//                             );
//                         });
//                     })()}

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


import React, { useState, useEffect } from 'react';
import styles from '../css/UserList.module.css';

const UserList = ({ users = [], onSelectUser, onDeleteUser }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedUsers, setPaginatedUsers] = useState([]);
    const usersPerPage = 5;

    // users가 바뀌면 currentPage를 1로 초기화
    useEffect(() => {
        setCurrentPage(1);
    }, [users]);

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

                    {(() => {
                        const maxVisible = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let endPage = startPage + maxVisible - 1;

                        if (endPage > totalPages) {
                            endPage = totalPages;
                            startPage = Math.max(1, endPage - maxVisible + 1);
                        }

                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                            const page = startPage + i;
                            return (
                                <button
                                    key={page}
                                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            );
                        });
                    })()}

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
