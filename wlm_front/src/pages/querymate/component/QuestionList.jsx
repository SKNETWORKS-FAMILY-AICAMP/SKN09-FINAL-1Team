import React, { useEffect, useState } from 'react';
import QuestionItem from './QuestionItem';
import Pagination from './Pagination';

const QuestionList = ({ searchParams }) => {
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

  const filtered = questions
    .filter((q) =>
      q.question.toLowerCase().includes(searchParams.keyword.toLowerCase())
    )
    .filter((q) =>
      searchParams.date ? q.date === searchParams.date : true
    )
    .sort((a, b) => {
      if (searchParams.sort === '최근순') return b.date.localeCompare(a.date);
      if (searchParams.sort === '오래된순') return a.date.localeCompare(b.date);
      return 0;
    });

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      {currentItems.length > 0 ? (
        currentItems.map((item) => <QuestionItem key={item.id} data={item} />)
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