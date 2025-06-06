import React, { useState, useEffect, useRef } from 'react';
import MicButton from './MicButton.jsx';
import ParticipantList from './ParticipantList.jsx';
import TranscriptBox from './TranscriptBox.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import InfoButton from './InfoButton.jsx';
import InfoModal from './InfoModal.jsx';
import '../css/notemate.css';

const NoteMate = ({ loginUserName }) => {  // 로그인 사용자 이름을 prop으로 받는다고 가정
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [modalStep, setModalStep] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [hostName, setHostName] = useState('이재혁');
  const [hostEmail, setHostEmail] = useState('smart5572@naver.com');
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  // step: init, recording, transcripted, summarized
  const [step, setStep] = useState('init');
  // 예시 텍스트
  const exampleTranscript = '예시 변환 텍스트입니다. 이곳에 음성 인식 결과가 표시됩니다.';
  const exampleSummary = '예시 요약 결과입니다. 이곳에 요약 결과가 표시됩니다.';
  const [showStartInfo, setShowStartInfo] = useState(false);
  const [showTranscriptInfo, setShowTranscriptInfo] = useState(false);
  const [isMeetingEnded, setIsMeetingEnded] = useState(false);

  // 현재 시간으로 meetingDate 설정 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    setMeetingDate(formatted);
  }, []);

  // db에서 유저목록 호출출
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
    setStep('transcripted'); // 녹음 종료 시 변환 텍스트 예시로 이동
    setIsMeetingEnded(true);
    setTimeout(() => {
      if (transcriptRef.current) {
        transcriptRef.current.setExampleTranscript(exampleTranscript);
      }
    }, 100); // ref가 연결된 후 예시 텍스트 입력
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
      `📅 회의 일자: ${meetingDate}\n👤 주최자: ${hostName} (${hostEmail})`
    );
    formData.append("transcript_file", new File([transcript], `${meetingDate}_회의록_전문.txt`, { type: "text/plain" }));
    formData.append("summary_file", new File([summary], `${meetingDate}_회의록_요약.txt`, { type: "text/plain" }));

    try {
      const res = await fetch('http://localhost:8001/send-email', {
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
                setStep('recording');
              }}
              onStop={() => {
                setModalStep('stopConfirm');
              }}
              step={step}
              disabled={isMeetingEnded}
            />
            <InfoButton onClick={() => setShowStartInfo(true)} />
          </div>
          <TranscriptBox
            isRecording={isRecording}
            elapsed={elapsed}
            onSave={() => console.log('Save Clicked')}
            onSummary={() => {
              setStep('summarized');
              setTimeout(() => {
                if (transcriptRef.current) {
                  transcriptRef.current.setExampleSummary(exampleSummary);
                }
              }, 100);
            }}
            ref={transcriptRef}
            registerSendEmailHandler={(fn) => {
              sendEmailRef.current = fn;
            }}
            step={step}
            showTranscriptInfo={showTranscriptInfo}
            setShowTranscriptInfo={setShowTranscriptInfo}
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