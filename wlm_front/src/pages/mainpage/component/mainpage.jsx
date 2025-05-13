import React from 'react';
import '../css/mainpage.css';

const MainPage = () => {
  return (
    <div className="mainpage">
      {/* Header */}


      {/* 메인 로고 */}
      <div className="main-logo-wrapper">
        <div className="main-logo"></div>
      </div>


      {/* Body Section */}
      <div className="body-section">
        <div className="card card-left">
          <div className="card-bg chat-bg"></div>
          <div className="card-img chat"></div>
          <div className="card-title">CHATMATE</div>
        </div>
        <div className="card card-right">
          <div className="card-bg note-bg"></div>
          <div className="card-img note"></div>
          <div className="card-title">NOTEMATE</div>
        </div>
        <div className="card card-bottom-left">
          <div className="card-bg query-bg"></div>
          <div className="card-img query"></div>
          <div className="card-title">QUERYMATE</div>
        </div>
        <div className="card card-bottom-right">
          <div className="card-bg call-bg"></div>
          <div className="card-img call"></div>
          <div className="card-title">CALLMATE</div>
        </div>
      </div>

      {/* Footer */}

    </div>
  );
};

export default MainPage;
