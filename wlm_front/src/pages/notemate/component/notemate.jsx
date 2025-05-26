import React, { useState, useEffect, useRef } from 'react';
// import Header from '../../../statics/component/header';
// import Footer from '../../../statics/component/footer';
import MicButton from './MicButton.jsx';
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
  const [participantsInfo, setParticipantsInfo] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);

  useEffect(() => {
    if (!isRecording) clearInterval(timerInterval);
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
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
    setTimerInterval(interval);
  };

  const stopMeeting = () => {
    clearInterval(timerInterval);
    setIsRecording(false);
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
          />
        </div>
      </div>

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
