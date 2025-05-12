import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/component/login.jsx';
import Notemate from './pages/notemate/component/notemate.jsx';


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
        <Route path="/notemate" element={<Notemate />} />
      </Routes>
    </Router>
  );
}

export default App;
