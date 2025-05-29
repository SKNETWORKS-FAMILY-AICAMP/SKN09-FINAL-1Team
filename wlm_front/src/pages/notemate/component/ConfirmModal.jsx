import React, { useEffect } from 'react';
import '../css/ConfirmModal.css';

const ConfirmModal = ({
  modalStep,
  setModalStep,
  startMeeting,
  stopMeeting,
  isReadyToSend,
  handleSendEmail,
  sendMessage
}) => {

  useEffect(() => {
    if (modalStep === 'sendConfirm' && isReadyToSend() === 'ready') {
      setModalStep('sendNotice');
    }
  }, [modalStep, isReadyToSend]);

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
      {modalStep === 'sendConfirm' && (() => {
        const status = isReadyToSend();
        if (status === 'missing_info') {
          return (
            <>
              <p>⚠️ 회의 정보가 모두 입력되지 않았습니다.<br />회의 정보를 모두 입력해주세요.</p>
              <button onClick={() => setModalStep(null)}>확인</button>
            </>
          );
        }
        if (status === 'missing_transcript') {
          return (
            <>
              <p>⚠️ 회의록 원문이 없습니다.<br />음성을 업로드하거나 전사를 완료해 주세요.</p>
              <button onClick={() => setModalStep(null)}>확인</button>
            </>
          );
        }
        if (status === 'missing_summary') {
          return (
            <>
              <p>⚠️ 회의 요약본이 없습니다.<br />요약없이 원문만 전송하겠습니까?</p>
              <button onClick={() => setModalStep('sendNotice')}>네</button>
              <button onClick={() => setModalStep(null)}>아니요</button>
            </>
          );
        }
        else
          return null;
      })()}
      {modalStep === 'sendNotice' && (
        <>
          <p>📩 회의록을 이메일로 전송하시겠습니까?</p>
          <button onClick={() => { setModalStep('sending'); handleSendEmail(); }}>네</button>
          <button onClick={() => setModalStep(null)}>아니요</button>
        </>
      )}
      {modalStep === 'sending' && (
        <>
          <p>📤 이메일을 전송 중입니다...</p>
        </>
      )}
      {modalStep === 'sending_complete' && (
        <>
          <p>{sendMessage}</p>
          <button onClick={() => setModalStep(null)}>확인</button>
        </>
      )}
      {modalStep === 'sending_error' && (
        <>
          <p>오류가 발생했습니다.<br /><strong>{sendMessage}</strong><br />관리자에게 문의하세요.</p>
          <button onClick={() => setModalStep(null)}>확인</button>
        </>
      )}
    </div>
  );
};

export default ConfirmModal;
