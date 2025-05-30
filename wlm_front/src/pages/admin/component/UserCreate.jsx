import React, { useState } from 'react';
import styles from '../css/UserCreate.module.css';

const UserCreate = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        emp_name: '',
        emp_code: '',
        emp_email: '',
        emp_birth_date: '',
        role: '0', // 기본값을 일반(0)으로 설정
        password: '1234' // 기본값을 1234로 설정
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateRandomPassword = () => {
        const randomNum = Math.floor(Math.random() * 1000000000);
        setFormData(prev => ({
            ...prev,
            password: randomNum.toString()
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // role을 숫자로 변환하여 전송
        onSubmit({
            ...formData,
            role: parseInt(formData.role)
        });
    };

    return (
        <div className={styles.createForm}>
            <h2 className={styles.formTitle}>새 사용자 등록</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="emp_name">이름</label>
                        <input
                            type="text"
                            id="emp_name"
                            name="emp_name"
                            value={formData.emp_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="emp_code">사원번호</label>
                        <input
                            type="text"
                            id="emp_code"
                            name="emp_code"
                            value={formData.emp_code}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">
                            비밀번호
                            <span className={styles.passwordNotice}>* 초기 비밀번호는 1234로 설정됩니다.</span>
                        </label>
                        <input
                            type="text"
                            id="password"
                            name="password"
                            value={formData.password}
                            readOnly
                            className={styles.disabledInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="emp_email">이메일</label>
                        <input
                            type="email"
                            id="emp_email"
                            name="emp_email"
                            value={formData.emp_email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="emp_birth_date">생년월일</label>
                        <input
                            type="date"
                            id="emp_birth_date"
                            name="emp_birth_date"
                            value={formData.emp_birth_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="role">역할</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="0">일반</option>
                            <option value="1">상담사</option>
                        </select>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>
                        등록
                    </button>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserCreate; 