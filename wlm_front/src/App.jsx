import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
// import Base from './pages/chatbot/chatbot_con/base.jsx'
// import Login from './pages/login/component/login.jsx'  
import Header from './statics/component/header.jsx';
import NoteMate from './pages/notemate/component/notemate.jsx';
import Base from './pages/chatbot/chatbot_con/Base.jsx';
import Login from './pages/login/component/login.jsx';
import Mainpage from './pages/mainpage/component/mainpage.jsx';
import Footer from './statics/component/footer';
import AdminPage from './pages/admin/AdminBase.jsx';
// import Signup from './pages/signup/component/signup.jsx'

function AppRoutes() {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/login", "/main"];
  const hideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Mainpage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/signup"          element={<Signup />} /> */}
        {/* <Route path="/querymate"       element={<QueryMate />} /> */}
        {/* <Route path="/callmate"        element={<CallMate />} /> */}
        <Route path="/notemate" element={<NoteMate />} />
        <Route path="/chatmate" element={<Base />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
