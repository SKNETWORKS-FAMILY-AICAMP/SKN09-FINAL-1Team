import React, { useState, useEffect } from 'react';
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

  return (
    <div className="record-page">
      {/* <Header /> */}

      <div className="record-body">
        <ParticipantList
          users={users}
          onUpdateUsers={setUsers}
          isRecording={isRecording}
          elapsed={elapsed}
          showSendButton={showSendButton}
        />

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

      <Footer />
    </div>
  );
};

export default NoteMate;