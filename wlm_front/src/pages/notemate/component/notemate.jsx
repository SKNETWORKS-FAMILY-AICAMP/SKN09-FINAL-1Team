import React, { useState, useEffect, useRef } from 'react';
import Header from '../../../statics/component/header';
import Footer from '../../../statics/component/footer';
import MicButton from '../../../components/MicButton.jsx';
import ParticipantList from '../../../components/ParticipantList.jsx';
import TranscriptBox from '../../../components/TranscriptBox.jsx';
import ConfirmModal from '../../../components/ConfirmModal.jsx';
import '../css/notemate.css';  

const NoteMate = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [modalStep, setModalStep] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [hostName, setHostName] = useState('');
  const [participantsInfo, setParticipantsInfo] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [users, setUsers] = useState([
    { name: '드무', email: 'dwuyoe@gmail.com', selected: false },
    { name: 'dwuq', email: 'dwuq@gmail.com', selected: false },
    { name: 'asdemx', email: 'asdemx@gmail.com', selected: false },
    { name: 'qweqwer@', email: 'qweqwer@naver.com', selected: false },
    { name: 'qwenvino', email: 'qwenvino@gmail.com', selected: false },
  ]);
  const [showSendButton, setShowSendButton] = useState(false);

  useEffect(() => {
    if (!isRecording) clearInterval(timerInterval);
    // eslint-disable-next-line
  }, [isRecording]);

    useEffect(() => {
    if (meetingDate && hostName && participantsInfo) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  }, [meetingDate, hostName, participantsInfo]);

  const startMeeting = () => {
    const now = Date.now();
    setIsRecording(true);
    setShowSendButton(false);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
    setTimerInterval(interval);
  };

  const stopMeeting = () => {
    clearInterval(timerInterval);
    setIsRecording(false);
    setShowSendButton(true);
  };

  const transcriptRef = useRef();


  return (
    <div className="record-page">
      <div className="record-body">
        <div className="record-left">
          {/* ✅ 회의 정보 입력 영역 */}
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

          {/* 기존 참가자 컴포넌트 */}
          <ParticipantList
            users={users}
            onUpdateUsers={setUsers}
            isRecording={isRecording}
            elapsed={elapsed}
            showSendButton={showSendButton}
            getTranscriptData={() => transcriptRef.current?.getTextData()}
            meetingDate={meetingDate}
            hostName={hostName}
            participantsInfo={participantsInfo}
          />
        </div>

        {/* 기존 Mic/Transcript */}
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
          />
        </div>
      </div>

      {/* 모달 */}
      {modalStep && (
        <ConfirmModal
          modalStep={modalStep}
          setModalStep={setModalStep}
          startMeeting={startMeeting}
          stopMeeting={stopMeeting}
        />
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default NoteMate;