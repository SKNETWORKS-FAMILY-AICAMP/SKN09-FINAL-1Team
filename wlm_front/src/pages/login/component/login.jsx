import React, { useState } from 'react';
import '../css/login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [empCode, setEmpCode] = useState('');
  const [empPwd, setEmpPwd] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/login',
        {
          emp_code: empCode,
          emp_pwd: empPwd
        },
        {
          withCredentials: true
        }
      );

      if (response.data.message === '로그인 성공') {
        // 세션 정보 확인을 위한 API 호출
        const sessionResponse = await axios.get('http://localhost:8000/api/check-session', {
          withCredentials: true
        });

        // 사용자 정보 콘솔 출력
        console.log('=== 로그인 성공 ===');
        console.log('이름:', sessionResponse.data.employee.emp_name);
        console.log('사원코드:', sessionResponse.data.employee.emp_code);
        console.log('이메일:', sessionResponse.data.employee.emp_email);
        console.log('==================');

        // 세션 정보를 localStorage에 저장(session에만 저장할거기에 사용 안함)
        // login(empCode);
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
          onClick={() => alert('비밀번호 찾기 기능은 준비 중입니다.')}
        >
          Forgot Password?
        </div>
      </div>
    </div>
  );
};

export default Login;
