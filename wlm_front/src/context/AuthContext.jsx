import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.error(`Error accessing localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => ({
    isLoggedIn: getStorageItem('isLoggedIn') === 'true',
    user: getStorageItem('user'),
    error: null
  }));

  const login = async (id) => {
    try {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', id);
      setAuthState({
        isLoggedIn: true,
        user: id,
        error: null
      });
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        error: '로그인 중 오류가 발생했습니다.'
      }));
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      setAuthState({
        isLoggedIn: false,
        user: null,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        error: '로그아웃 중 오류가 발생했습니다.'
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: authState.isLoggedIn, 
      user: authState.user, 
      error: authState.error,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
