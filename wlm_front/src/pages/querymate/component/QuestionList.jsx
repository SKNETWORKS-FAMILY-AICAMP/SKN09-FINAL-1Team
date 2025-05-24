import React, { useEffect, useState } from 'react';
import QuestionItem from './questionitem';
import Pagination from './Pagination';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 이 부분을 DB 연동 시 fetch 또는 axios 요청으로 대체
  useEffect(() => {
    const dummyData = [
  { id: 1, question: "생성형 AI 콘텐츠 저작권 문제는?", answer: "생성형 AI가 만든 콘텐츠의 저작권 귀속은 현재 명확히 법적으로 정해져 있지 않습니다.", date: "2025.05.01", status: "미답변" },
  { id: 2, question: "정부 AI 가이드라인 발표는 언제?", answer: "2025년 하반기 발표 예정입니다.", date: "2025.05.03", status: "승인" },
  { id: 3, question: "정부 AI 가이드라인 발표는 언제?", answer: "", date: "2025.05.03", status: "승인" },
  { id: 4, question: "생성형 AI 도입 시 기업이 주의할 점은?", answer: "", date: "2025.05.06", status: "미답변" },
  { id: 5, question: "AI로 작성한 보고서의 저작권은 누구에게 있나요?", answer: "", date: "2025.05.05", status: "승인" },
  { id: 6, question: "AI 기술 활용 관련 법적 이슈는?", answer: "", date: "2025.05.06", status: "미답변" },
  { id: 7, question: "AI가 만든 디자인도 저작권이 있나요?", answer: "", date: "2025.05.07", status: "미답변" },
];

    setQuestions(dummyData);
  }, []);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = questions.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      {currentItems.map((item) => (
        <QuestionItem key={item.id} data={item} />
      ))}
      <Pagination
        currentPage={currentPage}
        totalItems={questions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default QuestionList;
