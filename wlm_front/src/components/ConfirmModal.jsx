import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ modalStep, setModalStep, startMeeting, stopMeeting }) => {
  if (!modalStep) return null;

  return (
    <div className="custom-modal">
      {modalStep === 'startConfirm' && (
        <>
          <p>
            ⚠️ 비정상적으로 녹음이 중지되면 회의내용이 <span className="highlight">저장되지 않습니다!</span><br />
            회의를 시작하시겠습니까?
          </p>
          <button onClick={() => setModalStep('startNotice')}>네</button>
          <button onClick={() => setModalStep(null)}>아니요</button>
        </>
      )}
      {modalStep === 'startNotice' && (
        <>
          <p>🟢 회의를 시작합니다.</p>
          <button onClick={() => { startMeeting(); setModalStep(null); }}>확인</button>
        </>
      )}
      {modalStep === 'stopConfirm' && (
        <>
          <p>🛑 회의를 종료하시겠습니까?</p>
          <button onClick={() => setModalStep('stopNotice')}>네</button>
          <button onClick={() => setModalStep(null)}>아니요</button>
        </>
      )}
      {modalStep === 'stopNotice' && (
        <>
          <p>회의를 종료합니다.</p>
          <button onClick={() => { stopMeeting(); setModalStep(null); }}>확인</button>
        </>
      )}
    </div>
  );
};

export default ConfirmModal;
