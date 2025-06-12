// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(() => {
//     const storedAuth = localStorage.getItem('isLoggedIn');
//     return storedAuth === 'true';
//   });

//   const [user, setUser] = useState(() => {
//     return localStorage.getItem('user') || null;
//   });

//   const login = (id) => {
//     setIsLoggedIn(true);
//     setUser(id);
//     localStorage.setItem('isLoggedIn', 'true');
//     localStorage.setItem('user', id);
//   };

//   const logout = () => {
//     setIsLoggedIn(false);
//     setUser(null);
//     localStorage.removeItem('isLoggedIn');
//     localStorage.removeItem('user');
//   };

//   useEffect(() => {
//     localStorage.setItem('isLoggedIn', isLoggedIn.toString());
//     if (user) {
//       localStorage.setItem('user', user);
//     }
//   }, [isLoggedIn, user]);

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("localStorage에서 사용자 정보 파싱 실패:", e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true); // 인증 정보 로딩 상태

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("/api/check-session", {
          credentials: 'include' // 🌟 인증 정보를 포함하도록 설정 (가장 중요!)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("AuthContext - 백엔드 /check-session 응답 데이터:", data);

          if (data.employee) {
            const userData = {
              emp_no: data.employee.emp_no,
              name: data.employee.emp_name,    // emp_name을 name으로 매핑
              code: data.employee.emp_code,
              email: data.employee.emp_email,  // emp_email을 email으로 매핑
              create_dt: data.employee.emp_create_dt,
              birth_date: data.employee.emp_birth_date,
              role: data.employee.emp_role
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            setUser(null);
            localStorage.removeItem('user');
          }
        } else {
          // 401 Unauthorized 등 응답 실패 시
          setUser(null);
          localStorage.removeItem('user');
          console.log("AuthContext - 사용자 세션 유효하지 않음:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("AuthContext - 세션 확인 중 오류 발생:", error);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    checkUserSession();
  }, []);

  const login = (userData) => { // 이제 로그인 시 사용자 상세 정보 객체를 받음
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // TODO: 백엔드 로그아웃 API 호출 로직 추가 (예: fetch("http://localhost:8000/api/logout", { credentials: 'include' }))
  };

  const isLoggedIn = !!user; // user 객체가 null이 아니면 로그인된 상태

  const authContextValue = {
    isLoggedIn,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {loading ? <div>인증 정보 불러오는 중...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};