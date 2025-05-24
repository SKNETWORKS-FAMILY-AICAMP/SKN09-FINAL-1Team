import React, { useState } from 'react';
import '../css/questionitem.css';

const QuestionItem = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(data.status); // '승인' | '거부' | '수정'
  const [editing, setEditing] = useState(false); // textarea 표시 여부
  const [answer, setAnswer] = useState(data.answer || '');
  const [tempAnswer, setTempAnswer] = useState(data.answer || '');

  const handleClick = (newStatus) => {
    if (newStatus === '수정') {
      setEditing(true);
      setStatus('수정');
    } else if (newStatus === '승인') {
      setAnswer(tempAnswer);     // 저장
      setEditing(false);         // 수정 종료
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

          <div className="svg-button-group">
            <div className="svg-wrapper" onClick={() => handleClick('승인')}>
              <svg height="40" width="150">
                <rect className="shape" height="40" width="150" />
                <foreignObject x="0" y="0" width="150" height="40">
                  <div className="text">승인</div>
                </foreignObject>
              </svg>
            </div>

            <div className="svg-wrapper" onClick={() => handleClick('거부')}>
              <svg height="40" width="150">
                <rect className="shape shape-reject" height="40" width="150" />
                <foreignObject x="0" y="0" width="150" height="40">
                  <div className="text">거부</div>
                </foreignObject>
              </svg>
            </div>

            <div className="svg-wrapper" onClick={() => handleClick('수정')}>
              <svg height="40" width="150">
                <rect className="shape shape-edit" height="40" width="150" />
                <foreignObject x="0" y="0" width="150" height="40">
                  <div className="text">수정</div>
                </foreignObject>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
