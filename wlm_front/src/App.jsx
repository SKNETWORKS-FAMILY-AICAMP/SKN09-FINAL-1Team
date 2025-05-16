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



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
    
        <Routes>
          <Route path="/main"                element={<Mainpage />} />
          <Route path="/login"           element={<Login />} />
          {/* <Route path="/signup"          element={<Signup />} /> */}
          {/* <Route path="/querymate"       element={<QueryMate />} /> */}
          {/* <Route path="/callmate"        element={<CallMate />} /> */}
          <Route path="/notemate"        element={<NoteMate />} />
          <Route path="/chatmate"        element={<Base />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;





// function App() {
//   return (
//     <>
//       {/* <Base/> */}
//       <NoteMate/>
//     </>
//   );
// }

// export default App;

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/chatbot" element={<Base />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;