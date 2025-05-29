import React, { useEffect, useState } from 'react';
import QuestionItem from './QuestionItem';
import Pagination from './Pagination';
import styles from '../css/questionList.module.css';

const INITIAL_QUESTIONS = [
  { id: 1, question: "생성형 AI 콘텐츠 저작권 문제는?", answer: "", date: "2025.05.01", status: "대기" },
  { id: 2, question: "정부 AI 가이드라인 발표는 언제?", answer: "", date: "2025.05.03", status: "대기" },
  { id: 3, question: "법적 이슈는?", answer: "", date: "2025.05.04", status: "대기" },
  { id: 4, question: "AI 도입 시 주의점은?", answer: "", date: "2025.05.05", status: "대기" },
  { id: 5, question: "보고서 저작권?", answer: "", date: "2025.05.06", status: "대기" },
  { id: 6, question: "AI 기술 활용 관련 법적 이슈는?", answer: "", date: "2025.05.06", status: "대기" },
  { id: 7, question: "AI가 만든 디자인도 저작권이 있나요?", answer: "", date: "2025.05.07", status: "대기" },
];

const QuestionList = ({ searchParams }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 질문 생성 버튼 클릭 시
  const handleGenerateQuestions = async () => {
    setQuestions(INITIAL_QUESTIONS.map(q => ({ ...q, answer: "" })));
    setCurrentPage(1);

    INITIAL_QUESTIONS.forEach(async (q) => {
      try {
        const res = await fetch("http://localhost:8001/ask_query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q.question }),
        });
        const aiData = await res.json();
        const cleanAnswer = !aiData.answer || aiData.answer === "null" ? null : aiData.answer;

        setQuestions(prev =>
          prev.map(item =>
            item.id === q.id ? { ...item, answer: cleanAnswer } : item
          )
        );
      } catch (err) {
        setQuestions(prev =>
          prev.map(item =>
            item.id === q.id ? { ...item, answer: null } : item
          )
        );
      }
    });
  };

  const handleDelete = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: newStatus } : q
      )
    );
  };

  // 날짜 문자열을 Date 객체로 변환하는 함수
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  const filtered = questions
    .filter((q) => q.question.toLowerCase().includes((searchParams.keyword || "").toLowerCase()))
    .filter((q) => {
      if (!searchParams.dateRange) return true;
      const { startDate, endDate } = searchParams.dateRange;
      if (!startDate || !endDate) return true;
      
      const questionDate = parseDate(q.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return questionDate >= start && questionDate <= end;
    })
    .filter((q) => {
      if (!searchParams.status || searchParams.status === '전체') return true;
      return q.status === searchParams.status;
    });

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    handleGenerateQuestions();
  }, []);

  return (
    <div className={styles.listContainer}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>📋 민원 질문 목록</h2>
        <button
          className={styles.generateButton}
          onClick={handleGenerateQuestions}
        >
          질문 생성
        </button>
      </div>

      <div className={styles.questionList}>
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <QuestionItem
              key={item.id}
              data={item}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <p className={styles.noResults}>🔍 검색 결과가 없습니다.</p>
        )}
      </div>

      <div className={styles.paginationContainer}>
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default QuestionList;
