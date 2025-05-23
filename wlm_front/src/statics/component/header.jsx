import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/header.css';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../../src/pages/images/logo-image.png';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/querymate', label: 'QUERYMATE', icon: 'chat' },
    { path: '/notemate', label: 'NOTEMATE', icon: 'note' },
    { path: '/chatmate', label: 'CHATMATE', icon: 'claim' },
    { path: '/callmate', label: 'CALLMATE', icon: 'call' },
  ];

  return (
    <div className="header">
      {/* 로고 */}
      <div
        className="logo"
        style={{ backgroundImage: `url(${logoImage})` }}
        onClick={() => navigate(isLoggedIn ? '/main' : '/login')}
        role="button"
        aria-label="logo"
        title="홈으로 이동"
      />

      {/* 메뉴바 */}
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

      {/* 버튼 영역 */}
      <div className="header-buttons">
        {isLoggedIn ? (
          <div className="header-btn-wrap">
            <button className="header-btn" onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <>
            <div className="header-btn-wrap">
              <Link to="/login">
                <button className="header-btn">로그인</button>
              </Link>
            </div>
            <div className="header-btn-wrap">
              <Link to="/signup">
                <button className="header-btn">회원가입</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
