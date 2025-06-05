import React, { useState } from 'react';
import '../css/login.css';
import ForgotPasswordModal from './forgotpasswordmodal'; // 모달 컴포넌트 추가
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [empCode, setEmpCode] = useState('');
  const [empPwd, setEmpPwd] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showReset, setShowReset] = useState(false); // 비밀번호 초기화 모달 상태
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.post('http://43.201.98.14:8000/api/login',
        {
          emp_code: empCode,
          emp_pwd: empPwd
        },
        {
          withCredentials: true
        }
      );

      if (response.data.message === '로그인 성공') {
        console.log('=== 로그인 성공 ===');
        navigate('/main');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        error.response?.data?.detail ||
        '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  };

  return (
    <div className="container">
      {showReset && <ForgotPasswordModal onClose={() => setShowReset(false)} />}
      <div className="top"></div>
      <div className="bottom"></div>
      <div className="center">
        <img src="/images/wlbmate_logo.png" alt="WLB MATE" className="login-logo" />
        <h2>&nbsp;Please Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="사원번호"
            value={empCode}
            onChange={(e) => setEmpCode(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={empPwd}
            onChange={(e) => setEmpPwd(e.target.value)}
            required
          />
          <input type="submit" value="Login" />
        </form>
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        <div
          className="forgot-password"
          onClick={() => setShowReset(true)} // 클릭 시 모달 열림
        >
          Forgot Password?
        </div>
      </div>
    </div>
  );
};

export default Login;
