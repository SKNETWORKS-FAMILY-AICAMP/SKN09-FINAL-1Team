import React, { useState } from 'react';
import UserInfo from './UserInfo';
import PasswordChangeModal from './PasswordChangeModal';
import styles from '../css/MyPage.module.css';

const MyPage = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    // 임시 사용자 데이터 (나중에 실제 API로 대체)
    const userData = {
        emp_name: "홍길동",
        emp_code: "A001",
        emp_email: "hong@example.com",
        emp_birth_date: "1990-01-01",
        createdAt: "2024-01-01"
    };

    const handlePasswordChange = (currentPassword, newPassword) => {
        // 여기에 실제 비밀번호 변경 API 호출 로직 추가
        console.log('비밀번호 변경:', {
            현재_비밀번호: currentPassword,
            새_비밀번호: newPassword
        });
        alert('비밀번호가 성공적으로 변경되었습니다.');
        setShowPasswordModal(false);
    };

    return (
        <div className={styles.myPageContainer}>
            <h1 className={styles.pageTitle}>마이페이지</h1>
            <UserInfo 
                userData={userData}
                onPasswordChange={() => setShowPasswordModal(true)}
            />
            {showPasswordModal && (
                <PasswordChangeModal
                    onClose={() => setShowPasswordModal(false)}
                    onSubmit={handlePasswordChange}
                />
            )}
        </div>
    );
};

export default MyPage; 