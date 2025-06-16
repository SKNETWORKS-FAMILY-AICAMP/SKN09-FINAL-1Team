import React from 'react';
import styles from '../css/UserDetail.module.css';

const UserDetail = ({ user, onClose, onResetPassword }) => {
    const getRoleName = (role) => {
        return role === 1 ? '상담사' : '일반';
    };

    const handleResetPassword = () => {
        if (window.confirm('비밀번호를 초기화하시겠습니까?')) {
            onResetPassword(user.emp_no);
        }
    };

    return (
        <div className={styles.detailContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>사용자 상세 정보</h2>
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.resetButton}
                        onClick={handleResetPassword}
                        title="비밀번호 초기화"
                    >
                        비밀번호 초기화
                    </button>
                    <button className={styles.closeButton} onClick={onClose}>
                        닫기
                    </button>
                </div>
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
                        {/* <tr>
                            <th>아이디</th>
                            <td>{user.user_id}</td>
                        </tr> */}
                        <tr>
                            <th>이메일</th>
                            <td>{user.emp_email}</td>
                        </tr>
                        <tr>
                            <th>생년월일</th>
                            <td>{user.emp_birth_date ? new Date(user.emp_birth_date).toLocaleDateString() : ''}</td>
                        </tr>
                        <tr>
                            <th>역할</th>
                            <td>{getRoleName(user.role)}</td>
                        </tr>
                        <tr>
                            <th>계정 생성일</th>
                            <td>{user.emp_create_dt ? new Date(user.emp_create_dt).toLocaleDateString() : ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDetail; 