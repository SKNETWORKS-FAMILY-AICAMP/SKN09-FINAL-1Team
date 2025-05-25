import React from 'react';
import styles from '../css/UserDetail.module.css';

const UserDetail = ({ user, onClose }) => {
    return (
        <div className={styles.detailContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>사용자 상세 정보</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    닫기
                </button>
            </div>

            <div className={styles.content}>
                <table className={styles.detailTable}>
                    <tbody>
                        <tr>
                            <th>이름</th>
                            <td>{user.emp_name}</td>
                        </tr>
                        <tr>
                            <th>사원번호</th>
                            <td>{user.emp_code}</td>
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>{user.emp_email}</td>
                        </tr>
                        <tr>
                            <th>생년월일</th>
                            <td>{user.emp_birth_date ? new Date(user.emp_birth_date).toLocaleDateString() : ''}</td>
                        </tr>
                        <tr>
                            <th>계정 생성일</th>
                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDetail; 