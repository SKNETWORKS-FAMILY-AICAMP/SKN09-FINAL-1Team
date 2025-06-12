
import React, { useState } from 'react';
import styles from '../css/UserCreate.module.css';
import axios from 'axios';

const UserCreate = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        emp_name: '',
        emp_code: '',
        emp_email: '',
        emp_birth_date: '',
        emp_role: '1', 
        emp_pwd: '1234' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const employeeDataToSend = {
                emp_name: formData.emp_name,
                emp_code: formData.emp_code,
                emp_pwd: formData.emp_pwd,
                emp_email: formData.emp_email,
                emp_birth_date: formData.emp_birth_date,
                emp_role: parseInt(formData.emp_role)
            };

            const response = await axios.post(
                "http://localhost:8000/api/employees",
                employeeDataToSend,
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data && response.data.emp_no) {
                const newlyCreatedUser = {
                    ...employeeDataToSend,
                    emp_no: response.data.emp_no,
                    emp_create_dt: new Date().toISOString().split('T')[0]
                };
                if (onSubmit) {
                    onSubmit(newlyCreatedUser); // AdminBase로 새 사용자 정보만 전달
                }
                alert('사용자가 성공적으로 등록되었습니다!');
                if (onCancel) {
                    onCancel();
                }
            } else {
                alert('사용자 등록은 성공했으나, 데이터 처리 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail
                ? (Array.isArray(error.response.data.detail)
                    ? error.response.data.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join('\n')
                    : JSON.stringify(error.response.data.detail))
                : error.message;
            alert('사원 생성에 실패했습니다: ' + errorMessage);
        }
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
                        <label htmlFor="emp_pwd">
                            비밀번호
                            <span className={styles.passwordNotice}>
                                * 초기 비밀번호는 1234로 고정입니다.
                            </span>
                        </label>
                        <input
                            type="text"
                            id="emp_pwd"
                            name="emp_pwd"
                            value={formData.emp_pwd}
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
                        <label htmlFor="emp_role">역할</label>
                        <select
                            id="emp_role"
                            name="emp_role"
                            value={formData.emp_role}
                            onChange={handleChange}
                            required
                        >
                            <option value="0">관리자</option>
                            <option value="1">일반</option>
                            <option value="2">상담사</option>
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
