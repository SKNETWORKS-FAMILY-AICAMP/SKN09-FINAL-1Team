// import React, { useState, useEffect } from 'react';
// import '../css/notemate.css';
// import '../css/ParticipantList.css';

// const ParticipantList = ({
//   users,
//   allUsers,
//   isRecording,
//   onUpdateUsers,
//   setModalStep,
//   disableEmailButton,
//   hostName,  // 로그인 계정에서 가져오는 주최자 이름
//   step
// }) => {
//   const [filterType, setFilterType] = useState('이름');
//   const [filter, setFilter] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [newUser, setNewUser] = useState('');
//   const [selectedSuggestion, setSelectedSuggestion] = useState(null);
//   const [meetingDate, setMeetingDate] = useState('');

//   // 현재 시간 자동 적용
//   useEffect(() => {
//     const now = new Date();
//     const formattedDate = now.toLocaleString('ko-KR', {
//       year: 'numeric', month: '2-digit', day: '2-digit',
//       hour: '2-digit', minute: '2-digit'
//     });
//     setMeetingDate(formattedDate);
//   }, []);

//   // 로그인 사용자(주최자) 강제 등록
//   useEffect(() => {
//     if (hostName) {
//       const existingHost = users.find(user => user.name === hostName);
//       if (!existingHost) {
//         onUpdateUsers([{ name: hostName, email: '', selected: false }, ...users]);
//       }
//     }
//   }, [hostName, users, onUpdateUsers]);

//   const inputValue = filter;


//   const handleDelete = (index) => {
//     const updated = [...users];
//     updated.splice(index, 1);
//     onUpdateUsers(updated);
//   };

//   const handleCheck = (index) => {
//     const updated = [...users];
//     updated[index].selected = !updated[index].selected;
//     onUpdateUsers(updated);
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setFilter(value);
//     setNewUser(value);

//     if (value.length === 0) {
//       setSuggestions([]);
//       return;
//     }

//     const filtered = allUsers.filter(user =>
//       user.name.includes(value) || user.email.includes(value)
//     );

//     setSuggestions(filtered);
//   };

//   const handleSelectSuggestion = (user) => {
//     setSelectedSuggestion(user);
//     setFilter(`${user.name} (${user.email})`);
//     setSuggestions([]);
//   };


//   const handleRegister = () => {
//     if (!selectedSuggestion) {
//       alert("목록에 있는 사용자를 선택해주세요.");
//       return;
//     }

//     const alreadyAdded = users.some(u => u.email === selectedSuggestion.email);
//     if (alreadyAdded) {
//       alert("이미 추가된 사용자입니다.");
//       return;
//     }

//     onUpdateUsers([...users, { ...selectedSuggestion, selected: false }]);
//     setFilter('');
//     setSelectedSuggestion(null);
//   };

//   return (
//     <div className="record-left">
//       <h2>참가자 목록</h2>

//       {/* 검색 + 등록 */}
//       <div className="search-bar">
//         <select value={filterType} onChange={(e) => {
//           setFilterType(e.target.value);
//           setSuggestions([]);
//         }}>
//           <option>이름</option>
//           <option>이메일</option>
//         </select>
//         <input
//           type="text"
//           className="search-input"
//           placeholder={`${filterType} 검색`}
//           value={inputValue}
//           onChange={handleInputChange}
//         />
//         <button className="register-btn" onClick={handleRegister}>추가</button>
//         {suggestions.length > 0 && (
//           <ul className="suggestion-list">
//             {suggestions.map((user, idx) => (
//               <li key={idx} onClick={() => handleSelectSuggestion(user)}>
//                 {user.name} ({user.email})
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>


//       {/* 참가자 리스트 */}
//       <ul className="user-list">
//         <li>
//           <span>이름</span>
//           <span>이메일</span>
//           <span>삭제</span>
//         </li>
//         {users.map((user, idx) => (
//           <li key={idx}>
//             <span>{user.name}</span>
//             <span>{user.email}</span>
//             <button onClick={() => handleDelete(idx)}>✕</button>
//           </li>
//         ))}
//       </ul>

//       {/* 하단 버튼 */}
//       <div className="participant-actions">
//         <button
//           className="send-btn"
//           onClick={() => setModalStep('sendConfirm')}
//           disabled={step !== 'summarized'}
//         >📩 전송</button>
//       </div>
//     </div>
//   );
// };

// export default ParticipantList;
import React, { useState, useEffect } from 'react';
import '../css/notemate.css';
import '../css/ParticipantList.css';

const ParticipantList = ({
  users,
  allUsers,
  isRecording, // 현재 사용되지 않음
  onUpdateUsers,
  setModalStep,
  disableEmailButton, // 현재 사용되지 않음
  hostName,  // NoteMate로부터 받은 주최자 이름
  hostEmail, // 🌟 NoteMate로부터 받은 주최자 이메일
  step // 현재 사용되지 않음
}) => {
  const [filterType, setFilterType] = useState('이름');
  const [filter, setFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [newUser, setNewUser] = useState(''); // 현재 사용되지 않음 (filter와 동일하게 사용 중)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [meetingDate, setMeetingDate] = useState(''); // 현재 사용되지 않음 (NoteMate에서 관리)

  // 현재 시간 자동 적용 (NoteMate에서 이미 관리하므로 여기서는 제거하거나 필요에 따라 유지)
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    setMeetingDate(formattedDate); // NoteMate의 meetingDate와 독립적으로 동작
  }, []);

  // 로그인 사용자(주최자) 강제 등록 (hostName과 hostEmail이 유효할 때)
  useEffect(() => {
    // hostName과 hostEmail이 모두 유효하고, 아직 참가자 목록에 추가되지 않았을 때만 추가
    if (hostName && hostEmail) {
      const existingHost = users.find(user => user.name === hostName && user.email === hostEmail);
      if (!existingHost) {
        // 주최자 정보를 맨 앞에 추가하고, 기본적으로 이메일 수신 대상(selected: true)으로 설정
        onUpdateUsers([{ name: hostName, email: hostEmail, selected: true }, ...users]);
      }
    }
  }, [hostName, hostEmail, users, onUpdateUsers]); // hostName, hostEmail, users가 변경될 때마다 실행

  const inputValue = filter; // 입력 필드에 바인딩될 값

  const handleDelete = (index) => {
    const updated = [...users];
    updated.splice(index, 1); // 해당 인덱스의 참가자 제거
    onUpdateUsers(updated); // 부모 컴포넌트의 users 상태 업데이트
  };

  const handleCheck = (index) => {
    const updated = [...users];
    updated[index].selected = !updated[index].selected; // selected 상태 토글
    onUpdateUsers(updated); // 부모 컴포넌트의 users 상태 업데이트
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFilter(value); // 검색 필터 업데이트
    setNewUser(value); // 새 사용자 입력 필드 업데이트 (현재는 filter와 동일)

    if (value.length === 0) {
      setSuggestions([]); // 입력이 없으면 추천 목록 초기화
      return;
    }

    // 이름 또는 이메일로 전체 유저 목록 필터링하여 추천 목록 생성
    const filtered = allUsers.filter(user =>
      user.name.includes(value) || user.email.includes(value)
    );
    setSuggestions(filtered); // 추천 목록 업데이트
  };

  const handleSelectSuggestion = (user) => {
    setSelectedSuggestion(user); // 선택된 추천 사용자 저장
    setFilter(`${user.name} (${user.email})`); // 검색 필드를 선택된 사용자 정보로 채우기
    setSuggestions([]); // 추천 목록 숨기기
  };

  const handleRegister = () => {
    if (!selectedSuggestion) {
      alert("목록에 있는 사용자를 선택해주세요.");
      return;
    }

    // 이미 추가된 사용자인지 이메일로 확인
    const alreadyAdded = users.some(u => u.email === selectedSuggestion.email);
    if (alreadyAdded) {
      alert("이미 추가된 사용자입니다.");
      return;
    }

    // 선택된 사용자를 참가자 목록에 추가하고, selected: false로 초기화
    onUpdateUsers([...users, { ...selectedSuggestion, selected: false }]);
    setFilter(''); // 검색 필드 초기화
    setSelectedSuggestion(null); // 선택된 추천 사용자 초기화
  };

  return (
    <div className="record-left">
      <h2>참가자 목록</h2>

      {/* 검색 + 등록 */}
      <div className="search-bar">
        <select value={filterType} onChange={(e) => {
          setFilterType(e.target.value);
          setSuggestions([]); // 필터 타입 변경 시 추천 목록 초기화
        }}>
          <option>이름</option>
          <option>이메일</option>
        </select>
        <input
          type="text"
          className="search-input"
          placeholder={`${filterType} 검색`}
          value={inputValue}
          onChange={handleInputChange}
        />
        <button className="register-btn" onClick={handleRegister}>추가</button>
        {suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((user, idx) => (
              <li key={idx} onClick={() => handleSelectSuggestion(user)}>
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 참가자 리스트 */}
      <ul className="user-list">
        <li>
          <span>이름</span>
          <span>이메일</span>
          <span>삭제</span>
        </li>
        {users.map((user, idx) => (
          <li key={idx}>
            <span>{user.name}</span>
            <span>{user.email}</span>
            {/* 주최자는 삭제 버튼을 비활성화하거나 숨길 수 있습니다. (필요시 추가) */}
            <span>
              <button
                onClick={() => handleDelete(idx)}
                // disabled={user.name === hostName && user.email === hostEmail}
              >✕</button>
            </span>
          </li>
        ))}
      </ul>

      {/* 하단 버튼 */}
      <div className="participant-actions">
        <button
          className="send-btn"
          onClick={() => setModalStep('sendConfirm')} // 이메일 전송 확인 모달
          disabled={step !== 'summarized'} // 요약이 완료되어야 전송 버튼 활성화
        >📩 전송</button>
      </div>
    </div>
  );
};

export default ParticipantList;