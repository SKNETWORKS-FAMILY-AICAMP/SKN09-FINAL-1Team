import React from 'react';

const TranscriptBox = ({ onSave, onSummary }) => {
  return (
    <div className="transcript-box">
      <div className="transcript-actions">
        <button onClick={onSave}>✔ 저장</button>
        <button onClick={onSummary}>📄 요약</button>
      </div>
      <h4>🔊 음성 텍스트 변환</h4>
      <p>녹음이 완료되면 텍스트로 자동 전환됩니다.</p>
      <textarea placeholder="여기에 텍스트가 표시됩니다."></textarea>
    </div>
  );
};

export default TranscriptBox;
