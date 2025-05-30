import React from 'react';
import styles from '../admin.module.css';

function AdminHeader({ onCreateClick }) {
    return (
        <div className={styles.headerRow}>
            <h1 className={styles.title}>관리자 페이지</h1>
            <button className={styles.createButtonTop} onClick={onCreateClick}>
                새 사용자 등록
            </button>
        </div>
    );
}

export default AdminHeader; 