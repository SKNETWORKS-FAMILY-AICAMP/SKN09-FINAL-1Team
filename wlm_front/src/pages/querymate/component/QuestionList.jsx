import React, { useEffect, useState } from 'react';
import QuestionItem from './QuestionItem';
import Pagination from './Pagination';
import styles from '../css/questionList.module.css';

// const INITIAL_QUESTIONS = [
//   { id: 1, question: "생성형 AI 콘텐츠 저작권 문제는?", answer: "", date: "2025.05.01", status: "대기" },
//   { id: 2, question: "정부 AI 가이드라인 발표는 언제?", answer: "", date: "2025.05.03", status: "대기" },
//   { id: 3, question: "법적 이슈는?", answer: "", date: "2025.05.04", status: "대기" },
//   { id: 4, question: "AI 도입 시 주의점은?", answer: "", date: "2025.05.05", status: "대기" },
//   { id: 5, question: "보고서 저작권?", answer: "", date: "2025.05.06", status: "대기" },
//   { id: 6, question: "AI 기술 활용 관련 법적 이슈는?", answer: "", date: "2025.05.06", status: "대기" },
//   { id: 7, question: "AI가 만든 디자인도 저작권이 있나요?", answer: "", date: "2025.05.07", status: "대기" },
// ];

const QuestionList = ({ searchParams }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

    const mapStatus = (state) => {
    switch (state) {
      case 1: return "승인";
      case 2: return "수정완료";
      default: return "대기";
    }
  };

  const fetchQueryListFromServer = async () => {
    try {
      const res = await fetch("/api/get-query-list");

      if (!res.ok) {
        throw new Error(`API 응답 실패: ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("응답 데이터가 배열이 아님");
      }

      setQuestions(data);
    } catch (err) {
      console.error("민원 목록 가져오기 실패:", err);
      setQuestions([]); // 빈 배열로 초기화해서 .filter 에러 방지
    }
  };


  useEffect(() => {
    fetchQueryListFromServer();
  }, []);


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
      if (!searchParams.startDate && !searchParams.endDate) return true;
      
      const questionDate = parseDate(q.date);
      
      if (searchParams.startDate) {
        const start = new Date(searchParams.startDate);
        start.setHours(0, 0, 0, 0);
        if (questionDate < start) return false;
      }
      
      if (searchParams.endDate) {
        const end = new Date(searchParams.endDate);
        end.setHours(23, 59, 59, 999);
        if (questionDate > end) return false;
      }
      
      return true;
    })
    .filter((q) => {
      if (!searchParams.status || searchParams.status === '전체') return true;
      return q.status === searchParams.status;
    });

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div className={styles.listContainer}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>📋 민원 질문 목록</h2>
        <button
          className={styles.generateButton}
          onClick={fetchQueryListFromServer}
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
