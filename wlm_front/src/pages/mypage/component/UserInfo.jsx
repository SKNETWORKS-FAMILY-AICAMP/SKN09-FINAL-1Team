import React from 'react';
import styles from '../css/UserInfo.module.css';

const UserInfo = ({ userData, onPasswordChange }) => {
    const getRoleName = (role) => {
        return role === 1 ? '상담사' : '일반';
    };
    if (!userData) {
        return <div>사용자 정보를 불러오는 중...</div>;
    }
    return (
        <div className={styles.userInfoContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>내 정보</h2>
                <button 
                    className={styles.passwordChangeButton}
                    onClick={onPasswordChange}
                >
                    비밀번호 변경
                </button>
            </div>
            <div className={styles.content}>
                <table className={styles.infoTable}>
                    <tbody>
                        <tr>
                            <th>이름</th>
                            <td>{userData.emp_name}</td>
                        </tr>
                        <tr>
                            <th>사원번호</th>
                            <td>{userData.emp_code}</td>
                        </tr>
                        <tr>
                            <th>역할</th>
                            <td>{getRoleName(userData.role)}</td>
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>{userData.emp_email}</td>
                        </tr>
                        <tr>
                            <th>생년월일</th>
                            <td>
                                {userData.emp_birth_date ? 
                                    new Date(userData.emp_birth_date).toLocaleDateString() : 
                                    ''}
                            </td>
                        </tr>
                        <tr>
                            <th>계정 생성일</th>
                            <td>
                                {userData.emp_create_dt ? 
                                    new Date(userData.emp_create_dt).toLocaleDateString() : 
                                    ''}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInfo; 