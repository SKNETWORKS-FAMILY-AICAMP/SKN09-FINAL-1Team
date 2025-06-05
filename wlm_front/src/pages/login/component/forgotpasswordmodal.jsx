import React, { useState } from 'react';
import '../css/forgotPasswordModal.css';
import axios from 'axios';

const ForgotPasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    birth: '',
    empCode: '',
    email: '',
    department: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const isValid = {
    name: form.name.trim().length > 1,
    birth: !!form.birth,
    empCode: form.empCode.trim().length > 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    department: form.department.trim().length > 1,
  };

  const isFormValid = Object.values(isValid).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    try {
      const response = await axios.post('http://15.164.95.149:5173//api/reset-password', form);
      setMessage(response.data.message || '비밀번호가 1234로 초기화되었습니다.');
      setSuccess(true);
    } catch (error) {
      setMessage(error.response?.data?.detail || '비밀번호 초기화에 실패했습니다.');
      setSuccess(false);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2 className="modalTitle">🔐 비밀번호 찾기</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label>이름</label>
            <input
              type="text"
              name="name"
              placeholder="홍길동"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {!isValid.name && touched.name && (
              <p className="fieldError">이름이 잘못 입력되었습니다.</p>
            )}
          </div>

          <div className="inputGroup">
            <label>생년월일</label>
            <input
              type="date"
              name="birth"
              value={form.birth}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {!isValid.birth && touched.birth && (
              <p className="fieldError">생년월일을 입력해주세요.</p>
            )}
          </div>

          <div className="inputGroup">
            <label>사원번호</label>
            <input
              type="text"
              name="empCode"
              placeholder="EMP000"
              value={form.empCode}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {!isValid.empCode && touched.empCode && (
              <p className="fieldError">사원번호가 잘못 입력되었습니다.</p>
            )}
          </div>

          <div className="inputGroup">
            <label>사내 이메일</label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {!isValid.email && touched.email && (
              <p className="fieldError">올바른 이메일 형식이 아닙니다.</p>
            )}
          </div>

          <div className="inputGroup">
            <label>부서명</label>
            <input
              type="text"
              name="department"
              placeholder="전략기획팀"
              value={form.department}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {!isValid.department && touched.department && (
              <p className="fieldError">부서명이 잘못 입력되었습니다.</p>
            )}
          </div>

          {message && (
            <p className={`message ${success ? 'success' : 'error'}`}>{message}</p>
          )}

          <div className="buttonGroup">
            <button
              type="submit"
              className="submitButton"
              disabled={!isFormValid}
            >
              비밀번호 초기화
            </button>
            <button type="button" className="cancelButton" onClick={onClose}>
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
