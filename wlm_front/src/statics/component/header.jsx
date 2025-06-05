import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/header.css';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../../src/pages/images/logo-image.png';
import axios from 'axios';

// axios 기본 설정
axios.defaults.withCredentials = true;

const Header = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 세션 정보 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://43.201.98.14:8000/api/check-session');
        console.log('세션 체크 응답:', response.data);
        
        if (response.data.employee) {
          setSessionInfo(response.data.employee);
          // 세션이 유효하면 로그인 상태 유지
          if (!isLoggedIn) {
            login(response.data.employee.emp_code);
          }
        }
      } catch (error) {
        console.error('세션 체크 에러:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          setSessionInfo(null);
          logout();
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [location.pathname, login, logout, navigate, isLoggedIn]);

  const handleLogout = async () => {
    try {
      await axios.post('http://43.201.98.14:8000/api/logout');
      setSessionInfo(null);
      logout();
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

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <div className="header">로딩 중...</div>;
  }

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


