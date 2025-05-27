import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedAuth = localStorage.getItem('isLoggedIn');
    return storedAuth === 'true';
  });

  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') || null;
  });

  const login = (id) => {
    setIsLoggedIn(true);
    setUser(id);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', id);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (user) {
      localStorage.setItem('user', user);
    }
  }, [isLoggedIn, user]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
