import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/header.css';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../../src/pages/images/logo-image.png';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
    <div className="header">
      {/* 로고 */}
      <Link to="/main">
      <div className="logo" style={{ backgroundImage: `url(${logoImage})` }} />
      </Link>
      {/* 메뉴바 */}
      <div className="menubar">
        <Link to ="/querymate" className="menu-group">
          <div className="menu-icon chat"></div>
          <div className="menu-label">QUERYMATE</div>
        </Link>
        <Link to="/notemate" className="menu-group">
          <div className="menu-icon note"></div>
          <div className="menu-label">NOTEMATE</div>
        </Link>
        <Link to ="/chatmate" className="menu-group">
          <div className="menu-icon claim"></div>
          <div className="menu-label">CHATMATE</div>
        </Link>
        <Link to="/callmate" className="menu-group">
          <div className="menu-icon call"></div>
          <div className="menu-label">CALLMATE</div>
        </Link>
      </div>

      {/* 버튼 영역 */}
      <div className="header-buttons">
        {isLoggedIn ? (
          <div className="header-btn-wrap">
            <Link to="/login">
            <button className="header-btn" onClick={handleLogout}>로그아웃</button>
            </Link>
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
