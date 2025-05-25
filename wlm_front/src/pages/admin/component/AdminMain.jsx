import React from 'react';
import UserCreate from './UserCreate';
import UserDetail from './UserDetail';
import styles from '../admin.module.css';

function AdminMain({ showCreateForm, selectedUser, onCreateUser, onCancelCreate, onCloseDetail }) {
    return (
        <div className={styles.mainContent}>
            {showCreateForm ? (
                <UserCreate
                    onSubmit={onCreateUser}
                    onCancel={onCancelCreate}
                />
            ) : selectedUser ? (
                <UserDetail
                    user={selectedUser}
                    onClose={onCloseDetail}
                />
            ) : (
                <div className={styles.placeholder}>
                    사용자를 선택하거나 새 사용자를 생성하세요
                </div>
            )}
        </div>
    );
}

export default AdminMain; 