import React from 'react';
import styles from '../css/UserList.module.css';

const UserList = ({ users, onSelectUser, onDeleteUser }) => {
    return (
        <div className={styles.userList}>
            <h2 className={styles.listTitle}>사용자 목록</h2>
            <div className={styles.list}>
                {users.map((user) => (
                    <div key={user.emp_no} className={styles.userItem}>
                        <div
                            className={styles.userInfo}
                            onClick={() => onSelectUser(user)}
                        >
                            <span className={styles.userName}>{user.emp_name}</span>
                            <span className={styles.userId}>{user.emp_code}</span>
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
        </div>
    );
};

export default UserList; 