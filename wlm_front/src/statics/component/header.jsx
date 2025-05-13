import React from 'react';
import '../../statics/css/header.css';

import querymateImage from '../../../src/pages/images/querymate-image.png';
import notemateImage from '../../../src/pages/images/notemate-image.png';
import logoImage from '../../../src/pages/images/logo-image.png';
import callbotImage from '../../../src/pages/images/callbot-image.png';
import chatbotImage from '../../../src/pages/images/chatbot-image.png';

const Header = () => {
  return (
    <header className="notemate-header">
      <div className="logo-area">
        <img src={logoImage} alt="로고" />
        WLBMATE
      </div>

      <nav className="nav-links">
        <a href="#"><img src={querymateImage} alt="querymate" />QUERYMATE</a>
        <a href="#"><img src={notemateImage} alt="notemate" />NOTEMATE</a>
        <a href="#"><img src={chatbotImage} alt="chatbot" />CHATMATE</a>
        <a href="#"><img src={callbotImage} alt="callbot" />CALLMATE</a>
      </nav>

      <div className="header-actions">
        <button>내 정보</button>
        <button>로그아웃</button>
      </div>
    </header>
  );
};

export default Header;
