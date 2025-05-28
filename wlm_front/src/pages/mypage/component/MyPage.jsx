import React, { useState, useEffect } from 'react';
import UserInfo from './UserInfo';
import PasswordChangeModal from './PasswordChangeModal';
import styles from '../css/MyPage.module.css';
import axios from 'axios';

const MyPage = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [userData, setUserData] = useState(null);

    // 마이페이지 정보 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/mypage', {
                    withCredentials: true
                });
                setUserData(response.data);
            } catch (error) {
                console.error('마이페이지 데이터 로딩 실패:', error);
            }
        };

        fetchUserData();
    }, []);

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