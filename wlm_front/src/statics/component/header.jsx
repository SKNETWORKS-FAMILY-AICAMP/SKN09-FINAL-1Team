import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/header.css';
import logoImage from '../../pages/mainpage/css/wlbmate_logo.png';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionInfo, setSessionInfo] = useState(null);

  // 세션 정보 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/api/check-session', {
          withCredentials: true
        });
        setSessionInfo(response.data.employee);
      } catch (error) {
        setSessionInfo(null);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      // 현재 이 친구는 작동하면 안됨 일단 주석처리
      // try {
      //   await fetch("http://localhost:8002/api/delete_temp_vectors", {
      //     method: 'DELETE',
      //   });
      //   console.log("=> Qdrant 컬렉션 삭제 완료");
      // } catch (err) {
      //   console.warn("=> Qdrant 컬렉션 삭제 실패:", err);
      // }
      // 서버 세션 삭제를 위한 API 호출
      await axios.post('/api/logout', {}, {
        withCredentials: true
      });

      setSessionInfo(null);

      // 로그인 페이지로 이동
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const menuItems = [
    { path: '/querymate', label: 'QUERYMATE', icon: 'chat' },
    { path: '/notemate', label: 'NOTEMATE', icon: 'note' },
    { path: '/chatmate', label: 'CHATMATE', icon: 'claim' },
    { path: '/callmate', label: 'CALLMATE', icon: 'call' },
  ];

  const isMainPage = location.pathname === '/main';

  return (
    <div className="header">
      <div
        className="logo"
        style={{ backgroundImage: `url(${logoImage})` }}
        onClick={() => navigate(sessionInfo ? '/main' : '/login')}
        role="button"
        aria-label="logo"
        title="홈으로 이동"
      />

      {isMainPage ? (
        <div className="header-center-text">
          당신의 업무를 스마트하게, <strong> WLB_MATE</strong>
        </div>
      ) : (
        <div className="menubar">
          {menuItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`menu-group ${location.pathname === path ? 'active' : ''}`}
            >
              <div className={`menu-icon ${icon}`}></div>
              <div className="menu-label">{label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="header-buttons">
        {sessionInfo ? (
          <>
            <div className="header-btn-wrap">
              <Link to="/mypage">
                <button className="header-btn">내정보</button>
              </Link>
            </div>
            <div className="header-btn-wrap">
              <button className="header-btn" onClick={handleLogout}>로그아웃</button>
            </div>
          </>
        ) : (
          <div className="header-btn-wrap">
            <Link to="/login">
              <button className="header-btn">로그인</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;