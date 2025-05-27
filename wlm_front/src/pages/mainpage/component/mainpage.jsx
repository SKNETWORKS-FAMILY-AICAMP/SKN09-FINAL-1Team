import React, { useState } from 'react';
import '../css/mainpage.css';
import { Link } from 'react-router-dom';
import logoImg from '../css/wlbmate_logo.png';
import callImg from '../css/call.jpeg';
import chatImg from '../css/chat.jpeg';
import meetImg from '../css/meet.jpeg';
import queryImg from '../css/query.jpg';

const cards = [
  {
    key: "chatmate",
    title: "CHAT MATE",
    to: "/chatmate",
    bgClass: "chat-bg",
    imgClass: "chat",
    description: "CHATMATE는 실시간 채팅, 문서 기반 정보 검색, 문서 평가 기능을 제공합니다.",
  },
  {
    key: "notemate",
    title: "NOTE MATE",
    to: "/notemate",
    bgClass: "note-bg",
    imgClass: "note",
    description: "NOTEMATE는 회의록 작성과 이메일 전송 기능을 지원합니다.",
  },
  {
    key: "querymate",
    title: "QUERY MATE",
    to: "/querymate",
    bgClass: "query-bg",
    imgClass: "query",
    description: "QUERYMATE는 민원에 대한 답변을 자동으로 생성해주는 기능입니다.",
  },
  {
    key: "callmate",
    title: "CALL MATE",
    to: "/callmate",
    bgClass: "call-bg",
    imgClass: "call",
    description: "CALLMATE는 음성 상담 데이터를 기반으로 고품질의 QnA 데이터를 제공합니다.",
  },
];

const bgImages = {
  chatmate: chatImg,
  notemate: meetImg,
  querymate: queryImg,
  callmate: callImg,
};


const MainPage = () => {
  const [desc, setDesc] = useState("기능을 선택하면 설명이 이곳에 표시됩니다.");
  const [bg, setBg] = useState(null);

  const handleMouseEnter = (card) => {
    setDesc(card.description);
    setBg(bgImages[card.key]);
  };
  const handleMouseLeave = () => {
    setDesc("기능을 선택하면 설명이 이곳에 표시됩니다.");
    setBg(null);
  };

  return (
    <div className="main-wrapper">
      {/* 오른쪽 40vw에만 배경 이미지, 위아래+오른쪽 여백(푸터 가리지 않음) */}
      {bg && (
        <div
          className="bg-img-right"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}
      <div className="app-container">
        <div className="container">
          {/* 왼쪽 카드 영역: 원래대로 */}
          <div className="left-section">
            <div className="body-section">
              {cards.map(card => (
                <Link
                  key={card.key}
                  to={card.to}
                  className="card"
                  onMouseEnter={() => handleMouseEnter(card)}
                  onFocus={() => handleMouseEnter(card)}
                  onMouseLeave={handleMouseLeave}
                  onBlur={handleMouseLeave}
                  tabIndex={0}
                  aria-label={card.title}
                  title={card.title}
                >
                  <div className={`card-bg ${card.bgClass}`}></div>
                  <div className={`card-img ${card.imgClass}`}></div>
                  <div className="card-title">{card.title}</div>
                </Link>
              ))}
            </div>
          </div>
          <div className="right-text-only">
            {desc === "기능을 선택하면 설명이 이곳에 표시됩니다." ? (
              <div className="welcome-box">
                <p className="welcome-text-top">
                  당신의 업무를<br />스마트하게
                </p>
                <img src={logoImg} alt="로고" className="logo-img" />
                <p className="welcome-text-bottom">WLB_MATE</p>
              </div>
            ) : (
              <div className="desc-text-only">{desc}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
