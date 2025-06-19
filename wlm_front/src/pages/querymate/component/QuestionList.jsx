import React, { useEffect, useState } from 'react';
import QuestionItem from './QuestionItem';
import Pagination from './Pagination';
import styles from '../css/questionList.module.css';

const QuestionList = ({ searchParams }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
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

      const mapped = data.map((item) => ({
        id: item.query_no,
        question: item.query_title,
        answer: item.res_text,
        date: item.query_create_dt,
        status: mapStatus(item.res_state),
      }));

      setQuestions(mapped);
    } catch (err) {
      console.error("민원 목록 가져오기 실패:", err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    fetchQueryListFromServer();
  }, []);

  const generateUnansweredResponses = async () => {
    try {
      const res = await fetch("/model/generate-unanswered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`응답 실패: ${res.status}`);
      }

      const data = await res.json();
      console.log("응답 생성 결과:", data);

      if (data.success) {
        console.log(`${data.count}개의 미응답 질문에 대해 답변이 자동 생성되었습니다.`);
      } else {
        console.log("답변 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("답변 생성 중 오류:", err);
      console.log("답변 생성 중 오류가 발생했습니다.");
    }
  };

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    await generateUnansweredResponses();
    await fetchQueryListFromServer();
    setIsGenerating(false);
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

  const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  const filtered = questions
    .filter((q) =>
      q.question && q.question.toLowerCase().includes((searchParams.keyword || "").toLowerCase())
    )
    .filter((q) => {
      if (!searchParams.dateRange) return true;
      const questionDate = parseDate(q.date);
      const { startDate, endDate } = searchParams.dateRange;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (questionDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
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
          onClick={handleGenerateClick}
          disabled={isGenerating}
        >
          {isGenerating ? "답변 생성 중..." : "답변 생성"}
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
