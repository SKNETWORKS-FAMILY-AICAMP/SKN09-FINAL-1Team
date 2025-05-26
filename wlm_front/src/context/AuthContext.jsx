import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 로컬 스토리지에서 초기 로그인 상태 불러오기
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true'; // 문자열로 저장되므로 'true'인지 확인
  });

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
  };

  // 새로고침에도 로그인 상태 유지됨
  useEffect(() => {
    const saved = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(saved === 'true');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
