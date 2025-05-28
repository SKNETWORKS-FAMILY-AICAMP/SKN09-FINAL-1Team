import React, { useEffect, useState } from 'react';
import QuestionItem from './QuestionItem';
import Pagination from './Pagination';

const QuestionList = ({ searchParams }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const dummyData = [
      { id: 1, question: "생성형 AI 콘텐츠 저작권 문제는?", answer: "AI가 작성한 답변입니다.", date: "2025.05.01", status: "대기" },
      { id: 2, question: "정부 AI 가이드라인 발표는 언제?", answer: "하반기 예정", date: "2025.05.03", status: "대기" },
      { id: 3, question: "법적 이슈는?", answer: "AI가 작성한 답변입니다.", date: "2025.05.04", status: "대기" },
      { id: 4, question: "AI 도입 시 주의점은?", answer: "AI가 작성한 답변입니다.", date: "2025.05.05", status: "대기" },
      { id: 5, question: "보고서 저작권?", answer: "작성자 귀속", date: "2025.05.06", status: "대기" },
      { id: 6, question: "AI 기술 활용 관련 법적 이슈는?", answer: "AI가 작성한 답변입니다.", date: "2025.05.06", status: "대기" },
      { id: 7, question: "AI가 만든 디자인도 저작권이 있나요?", answer: "AI가 작성한 답변입니다.", date: "2025.05.07", status: "대기" },
    ];
    setQuestions(dummyData);
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

  const filtered = questions
    .filter((q) => q.question.toLowerCase().includes(searchParams.keyword.toLowerCase()))
    .filter((q) => (searchParams.date ? q.date === searchParams.date : true))
    .filter((q) => {
      if (searchParams.status === '전체') return true;
      return q.status === searchParams.status;
    });

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
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
        <p style={{ color: '#888' }}>🔍 검색 결과가 없습니다.</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default QuestionList;