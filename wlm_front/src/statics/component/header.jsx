import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/header.css';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../../src/pages/images/logo-image.png';
import axios from 'axios';

// axios 기본 설정
axios.defaults.withCredentials = true;

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionInfo, setSessionInfo] = useState(null);

  // 세션 정보 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://43.201.98.14:8000/api/check-session');
        console.log('세션 체크 응답:', response.data);
        setSessionInfo(response.data.employee);
      } catch (error) {
        console.error('세션 체크 에러:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          setSessionInfo(null);
          logout();  // 401 에러시 로그아웃 처리
        }
      }
    };
    
    if (isLoggedIn) {
      checkSession();
    }
  }, [isLoggedIn, logout]);

  const handleLogout = async () => {
    try {
      await axios.post('http://43.201.98.14:8000/api/logout');
      logout();
      setSessionInfo(null);
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


