import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './statics/component/header.jsx';
import NoteMate from './pages/notemate/component/notemate.jsx';
import Base from './pages/chatbot/chatbot_con/Base.jsx';
import Login from './pages/login/component/login.jsx';
import Mainpage from './pages/mainpage/component/mainpage.jsx';
import Footer from './statics/component/footer.jsx';
import MyPage from './pages/mypage/component/MyPage.jsx';
import CallMate from './pages/callmate/Callmate.jsx';
import AdminPage from './pages/admin/AdminBase.jsx';
import QueryMate from './pages/querymate/querymate.jsx'
import './App.module.css'

import './App.module.css'

function AppRoutes() {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/login"];
  const hideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div className="app-wrapper">
      {!hideHeader && <Header />}
      <div className="content-body">
        <Routes>
          <Route path="/"                element={<Login />} />
          <Route path="/main"            element={<Mainpage />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/admin"           element={<AdminPage />} />
          <Route path="/querymate"       element={<QueryMate />} />
          <Route path="/callmate"        element={<CallMate />} />
          <Route path="/notemate"        element={<NoteMate />} />
          <Route path="/chatmate"        element={<Base />} />
          <Route path="/mypage"          element={<MyPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
