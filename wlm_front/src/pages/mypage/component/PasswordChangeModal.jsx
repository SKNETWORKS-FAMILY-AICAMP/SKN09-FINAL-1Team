import React, { useState } from 'react';
import styles from '../css/PasswordChangeModal.module.css';

const PasswordChangeModal = ({ onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('현재 비밀번호와 새 비밀번호가 같습니다.');
            return;
        }

        onSubmit(currentPassword, newPassword);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>비밀번호 변경</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="currentPassword">현재 비밀번호</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="현재 비밀번호 입력"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword">새 비밀번호</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호 입력"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호 다시 입력"
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.submitButton}>
                            변경하기
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangeModal; 