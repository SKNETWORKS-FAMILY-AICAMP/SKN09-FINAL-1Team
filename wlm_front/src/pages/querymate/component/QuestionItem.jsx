import React, { useState } from 'react';
import '../css/questionitem.css';

const QuestionItem = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(data.status);
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(data.answer || '');
  const [tempAnswer, setTempAnswer] = useState(data.answer || '');

  const handleClick = (newStatus) => {
    if (newStatus === '수정') {
      setEditing(true);
      setStatus('수정');
    } else if (newStatus === '승인') {
      setAnswer(tempAnswer);
      setEditing(false);
      setStatus('승인');
    } else if (newStatus === '거부') {
      setEditing(false);
      setStatus('거부');
    }
  };

  return (
    <div className="question-item">
      <div className="question-header" onClick={() => setOpen(!open)}>
        <span className="question-text">Q: {data.question}</span>
        <div className="question-meta">
          <span className="date">{data.date}</span>
          <span className={`status-dot ${status}`} />
        </div>
      </div>

      {open && (
        <div className="answer-box">
          <strong>A:</strong>
          {editing ? (
            <textarea
              className="edit-textarea"
              value={tempAnswer}
              onChange={(e) => setTempAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
            />
          ) : (
            <p>{answer || '아직 답변이 작성되지 않았습니다.'}</p>
          )}

          <div className="btn-group">
            <a onClick={() => handleClick('승인')} className="btn green rounded">승인</a>
            <a onClick={() => handleClick('거부')} className="btn red rounded">거부</a>
            <a onClick={() => handleClick('수정')} className="btn yellow rounded">수정</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
