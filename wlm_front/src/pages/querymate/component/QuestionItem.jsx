import React, { useState, useEffect } from 'react';
import '../css/questionitem.css';
import styles from '../css/questionList.module.css';

const QuestionItem = ({ data, onDelete, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(data.answer ?? '');
  const [tempAnswer, setTempAnswer] = useState(data.answer ?? '');

  // data.answer가 바뀌면 내부 상태도 갱신
  useEffect(() => {
    setAnswer(data.answer ?? '');
    setTempAnswer(data.answer ?? '');
  }, [data.answer]);

  const updateAnswerOnServer = async (text, state) => {
    try {
      await fetch("/api/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_no: data.id,
          res_text: text,
          res_state: state,
        }),
      });
    } catch (err) {
      console.error("답변 상태 저장 실패:", err);
      alert("답변 저장 중 오류 발생");
    }
  };


  const handleClick = async (action) => {
    switch (action) {
      case '등록':
        await updateAnswerOnServer(answer, 1); // 상태 1 = 승인
        onStatusChange(data.id, '승인');
        setEditing(false);
        break;
      case '수정':
        setEditing(true);
        break;
      case '수정완료':
        setAnswer(tempAnswer);
        setEditing(false);
        await updateAnswerOnServer(tempAnswer, 2); // 상태 2 = 수정완료
        onStatusChange(data.id, '수정완료');
        break;
      case '수정취소':
        setTempAnswer(answer);
        setEditing(false);
        break;
      default:
        break;
    }
  };


  // 답변 표시 로직
  const renderAnswer = () => {
    if (editing) {
      return (
        <textarea
          className="edit-textarea"
          value={tempAnswer}
          onChange={(e) => setTempAnswer(e.target.value)}
        />
      );
    }
    if (answer === "") {
      return <p style={{ color: '#aaa' }}>답변 작성중...</p>;
    }
    if (answer === null || answer === "null") {
      return <p style={{ color: '#aaa' }}>아직 답변이 작성되지 않았습니다.</p>;
    }
    return <p>{answer}</p>;
  };

  const isRejected = data.status === '거부';
  const isModified = data.status === '수정완료';
  const isEditable = data.status === '대기';

  return (
    <div className={`${styles.questionItem} question-item`}>
      <div className={`${styles.statusBar} ${styles[data.status]}`} />
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
          {renderAnswer()}
          <div className="btn-group">
            {!editing && isEditable && (
              <>
                <a onClick={() => handleClick('등록')} className="btn green rounded">등록</a>
                <a onClick={() => handleClick('수정')} className="btn yellow rounded">수정</a>
              </>
            )}
            {!editing && isRejected && (
              <>
                <a onClick={() => handleClick('수정')} className="btn yellow rounded">수정</a>
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
