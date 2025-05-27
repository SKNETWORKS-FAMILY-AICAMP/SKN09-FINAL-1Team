import React, { useState, useEffect, useRef } from 'react';
import MicButton from './MicButton.jsx';
import ParticipantList from './ParticipantList.jsx';
import TranscriptBox from './TranscriptBox.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import '../css/notemate.css';

const NoteMate = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [modalStep, setModalStep] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [hostName, setHostName] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/employees");
        const result = await res.json();
        if (result.status === "success") {
          // 서버 응답에서 필요한 필드만 매핑해서 저장
          const mapped = result.data.map(user => ({
            name: user.emp_name,
            email: user.emp_email,
            selected: false,
          }));
          setAllUsers(mapped);
        }
      } catch (err) {
        console.error("유저 목록 불러오기 실패:", err);
      }
    };

    fetchAllUsers();
  }, []);


  const transcriptRef = useRef();

  useEffect(() => {
    if (!isRecording) clearInterval(timerInterval);
  }, [isRecording]);

  useEffect(() => {
    if (meetingDate && hostName) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  }, [meetingDate, hostName]);

  const startMeeting = () => {
    const now = Date.now();
    setIsRecording(true);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
    setTimerInterval(interval);
  };

  const stopMeeting = () => {
    clearInterval(timerInterval);
    setIsRecording(false);
  };

  const isReadyToSend = () => {
    const { transcript, summary } = transcriptRef.current?.getTextData() || {};
    if (!meetingDate || !hostName) return 'missing_info';
    if (!transcript) return 'missing_transcript';
    if (!summary) return 'missing_summary';
    return 'ready';
  };

  const sendEmailRef = useRef();
  const getTranscriptData = () => transcriptRef.current?.getTextData();

  const handleSendEmail = async () => {
    const selectedEmails = users.filter(user => user.selected).map(user => user.email);
    if (selectedEmails.length === 0) {
      alert("수신자를 선택해주세요.");
      return;
    }

    const { transcript, summary } = getTranscriptData?.() || {};

    const formData = new FormData();
    selectedEmails.forEach(email => formData.append("recipients", email));
    formData.append("subject", `Notemate에서 ${meetingDate} 회의록 전달드립니다`);
    formData.append(
      "body",
      `📅 회의 일자: ${meetingDate}\n👤 주최자: ${hostName}`
    );
    formData.append("transcript_file", new File([transcript], `${meetingDate}_회의록_전문.txt`, { type: "text/plain" }));
    formData.append("summary_file", new File([summary], `${meetingDate}_회의록_요약.txt`, { type: "text/plain" }));

    try {
      const res = await fetch('http://localhost:8000/send-email', {
        method: 'POST',
        body: formData,
      });
    
      const result = await res.json();
    
      if (res.status === 200) {
        setSendMessage(result.message); // 정상 응답
        setModalStep('sending_complete');
      } else {
        setSendMessage(`${res.status} ${res.statusText}`);
        setModalStep('sending_error');
      }
    } catch (err) {
      setSendMessage(err.message);
      setModalStep('sending_error');
      console.log("요청 실패");
    }
  };


  const isEmailStep = (modalStep) => {
  const emailSteps = [
    'sendConfirm',
    'missing_transcript',
    'missing_summary',
    'sendNotice',
    'sending',
    'sending_complete',
    'sending_error'
  ];
  return emailSteps.includes(modalStep);
};


  return (
    <div className="record-page">
      <div className="record-body">
        <div className="record-left">
          <div className="meeting-info">
            <div className="form-block">
              <label>회의 일자</label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="form-block">
              <label>주최자</label>
              <input
                type="text"
                placeholder="이름 입력"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
            </div>
          </div>

          <button
            className="confirm-btn"
            disabled={!isFormComplete}
            onClick={() => alert('회의 정보가 확인되었습니다!')}
          >
            확인
          </button>

          <ParticipantList
            users={users}
            allUsers={allUsers}
            onUpdateUsers={setUsers}
            isRecording={isRecording}
            elapsed={elapsed}
            getTranscriptData={() => transcriptRef.current?.getTextData()}
            meetingDate={meetingDate}
            hostName={hostName}
            setModalStep={setModalStep}
            setSendMessage={setSendMessage}
            disableEmailButton={isEmailStep(modalStep)}
          />
        </div>

        <div className="record-right">
          <MicButton
            isRecording={isRecording}
            elapsed={elapsed}
            onStart={() => setModalStep('startConfirm')}
            onStop={() => setModalStep('stopConfirm')}
          />
          <TranscriptBox
            isRecording={isRecording}
            elapsed={elapsed}
            onSave={() => console.log('Save Clicked')}
            onSummary={() => console.log('Summary Clicked')}
            ref={transcriptRef}
            registerSendEmailHandler={(fn) => {
              sendEmailRef.current = fn;
            }}
          />
        </div>
      </div>

      {modalStep && (
        <ConfirmModal
          modalStep={modalStep}
          setModalStep={setModalStep}
          startMeeting={startMeeting}
          stopMeeting={stopMeeting}
          isReadyToSend={isReadyToSend}
          handleSendEmail={handleSendEmail}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
};

export default NoteMate;