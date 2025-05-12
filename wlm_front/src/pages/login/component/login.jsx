// import React, { useState } from 'react';
// import '../css/login.css';

// const Login = () => {
//   const [id, setId] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (id && password) {
//       // 여기서 나중에 로그인 검증 로직 넣기
//       alert(`ID: ${id}, Password: ${password}`);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-logo-section">
//         <div className="icons-top">
//           <div className="icon-item">
//             <img src="/images/callbot.png" alt="CALLBOT" className="icon-img" />
//             <div className="icon-label">CALLBOT</div>
//           </div>
//           <div className="icon-item">
//             <img src="/images/notemate.png" alt="NOTEMATE" className="icon-img" />
//             <div className="icon-label">NOTEMATE</div>
//           </div>
//         </div>

//         <div className="icons-middle">
//           <div className="icon-item">
//             <img src="/images/chatmate.png" alt="CHATMATE" className="icon-img" />
//             <div className="icon-label">CHATMATE</div>
//           </div>
//           <img src="/images/wlbmate_logo.png" alt="WLB MATE" className="main-logo" />
//           <div className="icon-item">
//             <img src="/images/claimmate.png" alt="CLAIMMATE" className="icon-img" />
//             <div className="icon-label">CLAIMMATE</div>
//           </div>
//         </div>

//         <h1 className="logo-text">WLB MATE</h1>
//       </div>

//       <form className="login-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="ID"
//           className="login-input"
//           value={id}
//           onChange={(e) => setId(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="password"
//           className="login-input"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <div
//           className="forgot-password"
//           onClick={() => alert('비밀번호 찾기 기능은 준비 중입니다.')}
//         >
//           Forgot Password?
//         </div>
//         <button type="submit" className="login-button">Sign In</button>
//       </form>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import '../css/login.css'; // 위치 주의

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id && password) {
      alert('로그인 성공!'); // 임시 로직
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo-section">
        <div className="icon-curve">
          <div className="icon-item" style={{ top: '40px', left: '0' }}>
            <img src="/images/callbot.png" alt="CALLBOT" className="icon-img" />
            <div className="icon-label">CALLBOT</div>
          </div>
          <div className="icon-item" style={{ top: '0', left: '25%' }}>
            <img src="/images/notemate.png" alt="NOTEMATE" className="icon-img" />
            <div className="icon-label">NOTEMATE</div>
          </div>
          <div className="icon-item" style={{ top: '0', right: '25%' }}>
            <img src="/images/chatmate.png" alt="CHATMATE" className="icon-img" />
            <div className="icon-label">CHATMATE</div>
          </div>
          <div className="icon-item" style={{ top: '40px', right: '0' }}>
            <img src="/images/claimmate.png" alt="CLAIMMATE" className="icon-img" />
            <div className="icon-label">CLAIMMATE</div>
          </div>
        </div>

        <img src="/images/wlbmate_logo.png" alt="WLB MATE" className="main-logo" />
        <h1 className="logo-text">WLB MATE</h1>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="ID"
          className="login-input"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div
          className="forgot-password"
          onClick={() => alert('비밀번호 찾기 기능은 준비 중입니다.')}
        >
          Forgot Password?
        </div>
        <button type="submit" className="login-button">Sign In</button>
      </form>
    </div>
  );
};

export default Login;

