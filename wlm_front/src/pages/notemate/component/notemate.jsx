import React, { useState, useEffect, useRef } from 'react';
import MicButton from './MicButton.jsx';
import ParticipantList from './ParticipantList.jsx';
import TranscriptBox from './TranscriptBox.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import InfoButton from './InfoButton.jsx';
import InfoModal from './InfoModal.jsx';
import '../css/notemate.css';
import axios from 'axios';

const NoteMate = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [modalStep, setModalStep] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [step, setStep] = useState('init');
  const exampleTranscript = '예시 변환 텍스트입니다. 이곳에 음성 인식 결과가 표시됩니다.';
  const exampleSummary = '예시 요약 결과입니다. 이곳에 요약 결과가 표시됩니다.';
  const [showStartInfo, setShowStartInfo] = useState(false);
  const [showTranscriptInfo, setShowTranscriptInfo] = useState(false);
  const [isMeetingEnded, setIsMeetingEnded] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const transcriptRef = useRef();

  // user 객체가 로드되면 hostName과 hostEmail을 설정
  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const response = await axios.get('/api/check-session', { withCredentials: true });
        setHostName(response.data.employee['emp_name']);
        setHostEmail(response.data.employee['emp_email']);
      } catch (error) {
        console.error('세션 유저 정보 로드 실패:', error);
      }
    };
    fetchSessionUser();
  }, []);

  // 현재 시간으로 meetingDate 설정 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    setMeetingDate(formatted);
  }, []);

  // DB에서 전체 유저 목록을 불러오는 부분
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/employees");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        if (result.status === "success") {
          const mapped = result.data.map(user => ({
            name: user.emp_name,
            email: user.emp_email,
            selected: false,
          }));
          setAllUsers(mapped);
        } else {
          console.error("서버에서 성공 응답을 받지 못했습니다:", result.message);
        }
      } catch (err) {
        console.error("유저 목록 불러오기 실패:", err);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (!isRecording) clearInterval(timerInterval);
  }, [isRecording, timerInterval]);

  useEffect(() => {
    if (meetingDate && hostName && hostEmail) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  }, [meetingDate, hostName, hostEmail]);

  const startMeeting = () => {
    setStep('recording');
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
    setStep('transcripted');
    setIsMeetingEnded(true);
    setTimeout(() => {
      if (transcriptRef.current) {
        transcriptRef.current.setTranscript(exampleTranscript);
      }
    }, 100);
  };

  const isReadyToSend = () => {
    const { transcript, summary } = transcriptRef.current?.getTextData() || {};
    if (!meetingDate || !hostName || !hostEmail) return 'missing_info';
    if (!transcript) return 'missing_transcript';
    if (!summary) return 'missing_summary';
    return 'ready';
  };

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
      `📅 회의 일자: ${meetingDate}\n👤 주최자: ${hostName} (${hostEmail})`
    );
    formData.append("transcript_file", new File([transcript], `${meetingDate}_회의록_전문.txt`, { type: "text/plain" }));
    formData.append("summary_file", new File([summary], `${meetingDate}_회의록_요약.txt`, { type: "text/plain" }));

    try {
      const res = await fetch('/api/send-email', { 
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.status === 200) {
        setSendMessage(result.message);
        setModalStep('sending_complete');
      } else {
        setSendMessage(`${res.status} ${res.statusText} - ${result.message || ''}`);
        setModalStep('sending_error');
      }
    } catch (err) {
      setSendMessage(err.message);
      setModalStep('sending_error');
      console.error("이메일 요청 실패:", err);
    }
  };

  const isEmailStep = (modalStep) => {
    const emailSteps = [
      'sendConfirm', 'missing_transcript', 'missing_summary', 'sendNotice',
      'sending', 'sending_complete', 'sending_error'
    ];
    return emailSteps.includes(modalStep);
  };

  // 업로드 상태를 TranscriptBox에서 받아오기 위한 핸들러
  const handleUploadState = (uploaded) => {
    setIsUploaded(uploaded);
  };

  if (!hostName || !hostEmail) {
    return (
      <div className="record-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>사용자 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="record-page">
      <div className="record-body">
        <div className="record-left">
          <div className="meeting-info-container">
            <div className="meeting-info">
              <div className="form-block">
                <label>회의 일자</label>
                <div className="readonly-field">{meetingDate}</div>
              </div>
              <div className="form-block">
                <label>주최자</label>
                <div className="readonly-field">{hostName} ({hostEmail})</div>
              </div>
            </div>
          </div>
          <div className="participant-list-container">
            <ParticipantList
              users={users}
              allUsers={allUsers}
              onUpdateUsers={setUsers}
              isRecording={isRecording}
              elapsed={elapsed}
              getTranscriptData={() => transcriptRef.current?.getTextData()}
              meetingDate={meetingDate}
              hostName={hostName}
              hostEmail={hostEmail}
              setModalStep={setModalStep}
              setSendMessage={setSendMessage}
              disableEmailButton={isEmailStep(modalStep)}
              step={step}
            />
          </div>
        </div>

        <div className="record-right">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <MicButton
              isRecording={isRecording}
              elapsed={elapsed}
              onStart={() => {
                setModalStep('startConfirm');
              }}
              onStop={() => {
                setModalStep('stopConfirm');
              }}
              step={step}
              disabled={isMeetingEnded || isUploaded}
            />
            <InfoButton onClick={() => setShowStartInfo(true)} />
          </div>
          <TranscriptBox
            step={step}
            showTranscriptInfo={showTranscriptInfo}
            setShowTranscriptInfo={setShowTranscriptInfo}
            setStep={setStep}
            ref={transcriptRef}
            onUploadStateChange={handleUploadState}
            isRecording={isRecording}
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

      <InfoModal open={showStartInfo} onClose={() => setShowStartInfo(false)}>
        <b>회의 진행 방식 안내</b><br />
        1. 참가자를 추가한 뒤 <b>START</b> 버튼을 눌러 회의를 시작하세요.<br />
        2. 회의가 끝나면 <b>STOP</b> 버튼을 누르고, 안내에 따라 회의를 종료하세요.<br />
        3. 변환된 텍스트가 생성되면 수정할 수 있습니다.<br />
        4. <b>요약</b> 버튼을 눌러 요약 결과를 확인하고, 필요시 수정하세요.<br />
        <b>단!</b> 요약버튼을 누르면 변환된 텍스트 수정이 불가합니다. <br />
        5. <b>요약본 다운로드</b>와 <b>전송</b> 버튼이 활성화되면 회의록을 저장하거나 이메일로 전송할 수 있습니다.
      </InfoModal>
    </div>
  );
};

export default NoteMate;