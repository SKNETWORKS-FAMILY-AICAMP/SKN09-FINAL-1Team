import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/header.css';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../pages/mainpage/css/wlbmate_logo.png';
import axios from 'axios';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionInfo, setSessionInfo] = useState(null);

  // 세션 정보 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/check-session', {
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
      // 서버 세션 삭제를 위한 API 호출
      await axios.post('http://localhost:8000/api/logout', {}, {
        withCredentials: true
      });

      // 로컬 상태 초기화
      logout();
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
                {/* <button className="header-btn">내정보</button> */}
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



// 기존 header 코드
// import React from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import '../css/header.css';
// import { useAuth } from '../../context/AuthContext';
// import logoImage from '../../../src/pages/images/logo-image.png';

// const Header = () => {
//   const { isLoggedIn, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const menuItems = [
//     { path: '/querymate', label: 'QUERYMATE', icon: 'chat' },
//     { path: '/notemate', label: 'NOTEMATE', icon: 'note' },
//     { path: '/chatmate', label: 'CHATMATE', icon: 'claim' },
//     { path: '/callmate', label: 'CALLMATE', icon: 'call' },
//   ];

//   return (
//     <div className="header">
//       {/* 로고 */}
//       <div
//         className="logo"
//         style={{ backgroundImage: `url(${logoImage})` }}
//         onClick={() => navigate(isLoggedIn ? '/main' : '/login')}
//         role="button"
//         aria-label="logo"
//         title="홈으로 이동"
//       />

//       {/* 메뉴바 */}
//       <div className="menubar">
//         {menuItems.map(({ path, label, icon }) => (
//           <Link
//             key={path}
//             to={path}
//             className={`menu-group ${location.pathname === path ? 'active' : ''}`}
//           >
//             <div className={`menu-icon ${icon}`}></div>
//             <div className="menu-label">{label}</div>
//           </Link>
//         ))}
//       </div>

//       {/* 버튼 영역 */}
//       <div className="header-buttons">
//         {isLoggedIn ? (
//           <div className="header-btn-wrap">
//             <button className="header-btn" onClick={handleLogout}>로그아웃</button>
//           </div>
//         ) : (
//           <>
//             <div className="header-btn-wrap">
//               <Link to="/login">
//                 <button className="header-btn">로그인</button>
//               </Link>
//             </div>
//             <div className="header-btn-wrap">
//               <Link to="/signup">
//                 <button className="header-btn">회원가입</button>
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Header;


