import React, { useState } from 'react';
import '../css/mainpage.css';
import { Link } from 'react-router-dom';
import logoImg from '../css/wlb_logo.png';


const descriptions = {
  chatmate: "CHATMATE는 실시간 채팅, 문서 기반 정보 검색, 문서 평가 기능을 제공합니다.",
  notemate: "NOTEMATE는 회의록 작성과 이메일 전송 기능을 지원합니다.",
  querymate: "QUERYMATE는 민원에 대한 답변을 자동으로 생성해주는 기능입니다.",
  callmate: "CALLMATE는 음성 상담 데이터를 기반으로 고품질의 QnA 데이터를 제공합니다."
};

const MainPage = () => {
  const [desc, setDesc] = useState("기능을 선택하면 설명이 이곳에 표시됩니다.");

  const handleMouseEnter = (key) => setDesc(descriptions[key]);
  const handleMouseLeave = () => setDesc("기능을 선택하면 설명이 이곳에 표시됩니다.");

  return (
    <div className="main-wrapper">
      <div className="app-container">
        <div className="container">
          <div className="left-section">
            <div className="body-section">
              <Link
                to='/chatmate'
                className="card"
                onMouseEnter={() => handleMouseEnter("chatmate")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="card-bg chat-bg"></div>
                <div className="card-img chat"></div>
                <div className="card-title">CHATMATE</div>
              </Link>
              <Link
                to='/notemate'
                className="card"
                onMouseEnter={() => handleMouseEnter("notemate")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="card-bg note-bg"></div>
                <div className="card-img note"></div>
                <div className="card-title">NOTEMATE</div>
              </Link>
              <Link
                to='/querymate'
                className="card"
                onMouseEnter={() => handleMouseEnter("querymate")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="card-bg query-bg"></div>
                <div className="card-img query"></div>
                <div className="card-title">QUERYMATE</div>
              </Link>
              <Link
                to='/callmate'
                className="card"
                onMouseEnter={() => handleMouseEnter("callmate")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="card-bg call-bg"></div>
                <div className="card-img call"></div>
                <div className="card-title">CALLMATE</div>
              </Link>
            </div>
          </div>
          <div className="right-section">
            {desc === "기능을 선택하면 설명이 이곳에 표시됩니다." ? (
              <img src={logoImg} alt="로고" className="logo-img" />
             ) : (
              <p>{desc}</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
