import React, { useState } from 'react';
import '../css/questionitem.css';

const QuestionItem = ({ data, onDelete, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(data.answer || 'AI가 작성한 답변입니다.');
  const [tempAnswer, setTempAnswer] = useState(answer);

  const handleClick = (action) => {
    switch (action) {
      case '승인':
        onStatusChange(data.id, '승인');
        setEditing(false);
        break;
      case '거부':
        onStatusChange(data.id, '거부');
        break;
      case '수정':
        setEditing(true);
        break;
      case '수정완료':
        setAnswer(tempAnswer);
        setEditing(false);
        onStatusChange(data.id, '수정됨');
        break;
      case '수정취소':
        setTempAnswer(answer);
        setEditing(false);
        break;
      case '삭제':
        onDelete(data.id);
        break;
      default:
        break;
    }
  };

  const isRejected = data.status === '거부';
  const isModified = data.status === '수정됨';
  const isEditable = data.status === '대기';

  return (
    <div className="question-item">
      <div className="question-header" onClick={() => setOpen(!open)}>
        <span className="question-text">Q: {data.question}</span>
        <div className="question-meta">
          <span className="date">{data.date}</span>
          <span className={`status-dot ${data.status}`} />
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
            />
          ) : (
            <p>{answer}</p>
          )}

          <div className="btn-group">
            {!editing && isEditable && (
              <>
                <a onClick={() => handleClick('승인')} className="btn green rounded">승인</a>
                <a onClick={() => handleClick('거부')} className="btn red rounded">거부</a>
                <a onClick={() => handleClick('수정')} className="btn yellow rounded">수정</a>
              </>
            )}
            {!editing && isRejected && (
              <>
                <a onClick={() => handleClick('수정')} className="btn yellow rounded">수정</a>
                <a onClick={() => handleClick('삭제')} className="btn red rounded">삭제</a>
              </>
            )}
            {editing && (
              <>
                <a onClick={() => handleClick('수정완료')} className="btn yellow rounded">수정 완료</a>
                <a onClick={() => handleClick('수정취소')} className="btn red rounded">수정 취소</a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
