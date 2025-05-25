import React, { useState } from 'react';
import styles from '../css/UserCreate.module.css';

const UserCreate = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        emp_name: '',
        emp_code: '',
        emp_email: '',
        emp_birth_date: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className={styles.createForm}>
            <h2 className={styles.formTitle}>새 사용자 생성</h2>
            <form onSubmit={handleSubmit}>
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

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>
                        생성
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