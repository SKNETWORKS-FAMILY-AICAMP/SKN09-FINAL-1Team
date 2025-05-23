import React from 'react';
import beforeMeetingImage from '../pages/images/before-meeting.png';

const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const MicButton = ({ isRecording, elapsed, onStart, onStop }) => (
  <div className="mic-icon">
    <button className={`mic-button learn-more-style`} onClick={isRecording ? onStop : onStart}>
      {isRecording && <div className="mic-pulse" />}
      <img src={beforeMeetingImage} alt="mic" />
      <span className="mic-label">{isRecording ? 'Stop' : 'Start'}</span>
    </button>
    {isRecording && <div className="timer-text">⏱ {formatTime(elapsed)}</div>}
  </div>
);

export default MicButton;
