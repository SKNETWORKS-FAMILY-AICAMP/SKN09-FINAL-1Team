import React, { useState } from 'react';
import styles from '../css/PasswordChangeModal.module.css';
import '../css/ResultModal.css';

const PasswordChangeModal = ({ onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCheckPassword, setNewCheckPassword] = useState('');
    const [error, setError] = useState('');
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState('');
    const [isChanging, setIsChanging] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [showResultModal, setShowResultModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleVerifyCurrentPassword = async () => {
        if (!currentPassword) {
            setVerifyMessage('현재 비밀번호를 입력해주세요.');
            return;
        }
        
        setIsVerifying(true);
        try {
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ password: currentPassword }),
            });
            
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                setIsCurrentPasswordVerified(true);
                setVerifyMessage('현재 비밀번호가 확인되었습니다.');
            } else {
                setVerifyMessage(data.message || '현재 비밀번호가 일치하지 않습니다.');
                setIsCurrentPasswordVerified(false);
            }
        } catch (err) {
            setVerifyMessage('비밀번호 확인 중 오류가 발생했습니다.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChangePassword = async (newPassword, newCheckPassword) => {
        try {
            const response = await fetch('/api/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    newPassword: newPassword,
                    checkNewPassword: newCheckPassword
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setResultMessage('비밀번호가 성공적으로 변경되었습니다.');
            } else {
                setIsSuccess(false);
                setResultMessage(data.message || '비밀번호 변경 중 오류가 발생했습니다.');
            }
            setShowResultModal(true);
        } catch (err) {
            setIsSuccess(false);
            setResultMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            setShowResultModal(true);
        } finally {
            setIsChanging(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !newCheckPassword) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== newCheckPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!isCurrentPasswordVerified) {
            setError('현재 비밀번호를 먼저 확인해주세요.');
            return;
        }

        setIsChanging(true);
        setError('');
        await handleChangePassword(newPassword, newCheckPassword);
    };

    const handleResultConfirm = () => {
        setShowResultModal(false);
        if (isSuccess) {
            onClose();
        }
    };

    return (
        <>
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <h2 className={styles.modalTitle}>비밀번호 변경</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="currentPassword">현재 비밀번호</label>
                            <div className={styles.currentPasswordGroup}>
                                <input
                                    className={styles.currentPasswordInput}
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => {
                                        setCurrentPassword(e.target.value);
                                        setIsCurrentPasswordVerified(false);
                                        setVerifyMessage('');
                                    }}
                                    placeholder="현재 비밀번호 입력"
                                    disabled={isCurrentPasswordVerified}
                                />
                                <button
                                    type="button"
                                    className={styles.verifyButton}
                                    onClick={handleVerifyCurrentPassword}
                                    disabled={isCurrentPasswordVerified || isVerifying}
                                >
                                    {isVerifying ? '확인 중...' : isCurrentPasswordVerified ? '확인 완료' : '확인'}
                                </button>
                            </div>
                            {verifyMessage && (
                                <div className={`${styles.verifyMessage} ${isCurrentPasswordVerified ? styles.verifySuccess : ''}`}>
                                    {verifyMessage}
                                </div>
                            )}
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword">새 비밀번호</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="새 비밀번호 입력"
                                disabled={!isCurrentPasswordVerified}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={newCheckPassword}
                                onChange={(e) => setNewCheckPassword(e.target.value)}
                                placeholder="새 비밀번호 다시 입력"
                                disabled={!isCurrentPasswordVerified}
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.submitButton}
                                disabled={!isCurrentPasswordVerified || isChanging}
                            >
                                {isChanging ? '변경 중...' : '변경하기'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className={styles.cancelButton}
                                disabled={isChanging}
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showResultModal && (
                <div className={`result-modal ${isSuccess ? 'success' : 'error'}`}>
                    <p>{resultMessage}</p>
                    <button 
                        className="confirm-button"
                        onClick={handleResultConfirm}
                    >
                        확인
                    </button>
                </div>
            )}
        </>
    );
};

export default PasswordChangeModal; 