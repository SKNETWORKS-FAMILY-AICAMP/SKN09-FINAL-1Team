import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
// import Base from './pages/chatbot/chatbot_con/base.jsx'
// import Login from './pages/login/component/login.jsx'  
import Header from './statics/component/header.jsx';
import NoteMate from './pages/notemate/component/notemate.jsx';
import Base  from './pages/chatbot/chatbot_con/Base.jsx';
import Login     from './pages/login/component/login.jsx';
import Mainpage from './pages/mainpage/component/mainpage.jsx';
import Footer from './statics/component/footer';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />    
        <Routes>
          <Route path="/"                element={<Login />} />
          <Route path="/main"            element={<Mainpage />} />
          <Route path="/login"           element={<Login />} />
          {/* <Route path="/signup"          element={<Signup />} /> */}
          {/* <Route path="/querymate"       element={<QueryMate />} /> */}
          {/* <Route path="/callmate"        element={<CallMate />} /> */}
          <Route path="/notemate"        element={<NoteMate />} />
          <Route path="/chatmate"        element={<Base />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
