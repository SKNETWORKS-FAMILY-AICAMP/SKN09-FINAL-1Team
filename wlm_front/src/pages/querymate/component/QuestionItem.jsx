import React, { useState } from 'react';
import '../css/questionitem.css';

const QuestionItem = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(data.status); // 승인 / 거부 / 수정

  const handleClick = (newStatus) => {
    setStatus(newStatus);
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
          A: {data.answer || '아직 답변이 작성되지 않았습니다.'}

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
