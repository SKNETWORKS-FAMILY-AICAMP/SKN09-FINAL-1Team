import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Base from './pages/chatbot/chatbot_con/base.jsx'
// import Login from './pages/login/component/login.jsx'  
import NoteMate from './pages/notemate/component/notemate.jsx';

function App() {
  return (
    <>
      {/* <Base/> */}
      <NoteMate/>
    </>
  );
}

export default App;

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