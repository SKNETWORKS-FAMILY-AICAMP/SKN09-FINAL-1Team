import React, { useState, useEffect } from 'react';
import '../css/login.css';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from './forgotpasswordmodal'; // 모달 컴포넌트 추가
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showReset, setShowReset] = useState(false); // 비밀번호 초기화 모달 상태z
  const [errorMessage, setErrorMessage] = useState('');

  // 세션 체크 및 리다이렉트
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/api/check-session', {
          withCredentials: true
        });
        if (response) {
          navigate('/main');
        }
      } catch (error) {
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        if (data.employee) {
          const userData = {
            emp_no: data.employee.emp_no,
            name: data.employee.emp_name,
            code: data.employee.emp_code,
            email: data.employee.emp_email,
            create_dt: data.employee.emp_create_dt,
            birth_date: data.employee.emp_birth_date,
            role: data.employee.emp_role
          };
          // login(userData); // AuthContext의 login 함수에 사용자 상세 정보 객체 전달
          navigate('/main'); // 로그인 성공 후 메인 페이지로 이동
        } else {
          alert('로그인 성공했으나 사용자 정보가 없습니다. 관리자에게 문의하세요.');
        }

      } else {
        const errorData = await response.json();
        alert(`로그인 실패: ${errorData.detail || '아이디 또는 비밀번호를 확인해주세요.'}`);
      }
    } catch (error) {
      console.error('로그인 요청 중 오류 발생:', error);
      alert('네트워크 오류 또는 서버에 연결할 수 없습니다.');
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
        <form onSubmit={handleLogin}>
            <input
              type="text"
              id="username"
              value={username}
              placeholder="사원번호"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              id="password"
              value={password}
              placeholder="비밀번호"
              onChange={(e) => setPassword(e.target.value)}
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