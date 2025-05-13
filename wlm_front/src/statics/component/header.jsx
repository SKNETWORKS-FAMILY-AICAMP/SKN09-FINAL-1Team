import React from 'react';
import '../css/header.css';

import logoImage from '../../../src/pages/images/logo-image.png';

const Header = () => {
  return (
    <div className="header">
      {/* 로고 */}
      <div className="logo" style={{ backgroundImage: `url(${logoImage})` }} />

      {/* 메뉴바 */}
      <div className="menubar">
        <a href="/querymate" className="menu-group">
          <div className="menu-icon chat"></div>
          <div className="menu-label">QUERYMATE</div>
        </a>
        <a href="/" className="menu-group">
          <div className="menu-icon note"></div>
          <div className="menu-label">NOTEMATE</div>
        </a>
        <a href="#" className="menu-group">
          <div className="menu-icon claim"></div>
          <div className="menu-label">CHATMATE</div>
        </a>
        <a href="#" className="menu-group">
          <div className="menu-icon call"></div>
          <div className="menu-label">CALLMATE</div>
        </a>
      </div>

      {/* 버튼 영역 */}
      <div className="header-buttons">
        <div className="header-btn-wrap">
          <button className="header-btn">로그인</button>
        </div>
        <div className="header-btn-wrap">
          <button className="header-btn">회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
