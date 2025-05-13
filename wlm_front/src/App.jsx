import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/component/login.jsx';
// import Notemate from './pages/notemate/component/MainPage.jsx';
import MainPage from './pages/mainpage/component/mainpage.jsx';


// function App() {
//   return (
//     <div className="App">
//       <Notemate />
//       <Login />
//     </div>
//   );
// }

// export default App;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
