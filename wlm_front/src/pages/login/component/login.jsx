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
      // 로그인 요청
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
        console.log('로그인 응답:', response.data);
        
        // 세션이 설정될 시간을 주기 위해 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // 세션 정보 확인을 위한 API 호출
          const sessionResponse = await axios.get('http://43.201.98.14:8000/api/check-session', {
            withCredentials: true
          });

          // 사용자 정보 콘솔 출력
          console.log('=== 로그인 성공 ===');
          console.log('이름:', sessionResponse.data.employee.emp_name);
          console.log('사원코드:', sessionResponse.data.employee.emp_code);
          console.log('이메일:', sessionResponse.data.employee.emp_email);
          console.log('==================');

          navigate('/main');
        } catch (sessionError) {
          console.error('세션 확인 오류:', sessionError);
          if (sessionError.response?.status === 401) {
            setErrorMessage('세션 인증에 실패했습니다. 다시 로그인해주세요.');
          } else {
            setErrorMessage('세션 확인 중 오류가 발생했습니다.');
          }
        }
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
