import React from 'react';
import '../css/mainpage.css';
import { Link } from 'react-router-dom';
import Header from '../../../statics/component/header';

const MainPage = () => {

  return (
    <div className="mainpage">
      <Header />

      {/* Body Section */}
      <div className="body-section">
        <Link to='/chatmate' className="card">
          <div className="card-bg chat-bg"></div>
          <div className="card-img chat"></div>
          <div className="card-title">CHATMATE</div>
        </Link>
        <Link to='/notemate' className="card">
          <div className="card-bg note-bg"></div>
          <div className="card-img note"></div>
          <div className="card-title">NOTEMATE</div>
        </Link>
        <Link to='/querymate' className="card">
          <div className="card-bg query-bg"></div>
          <div className="card-img query"></div>
          <div className="card-title">QUERYMATE</div>
        </Link>
        <Link to='/callmate' className="card">
          <div className="card-bg call-bg"></div>
          <div className="card-img call"></div>
          <div className="card-title">CALLMATE</div>
        </Link>
      </div>


    </div>
  );
};

export default MainPage;
