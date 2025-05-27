// import React, { useEffect, useState } from 'react';
// import QuestionItem from './questionitem';
// import Pagination from './Pagination';

// const QuestionList = ({ searchParams }) => {
//   const [questions, setQuestions] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;


//   // 이 부분을 DB 연동 시 fetch 또는 axios 요청으로 대체
//   useEffect(() => {
//     const dummyData = [
//   { id: 1, question: "생성형 AI 콘텐츠 저작권 문제는?", answer: "생성형 AI가 만든 콘텐츠의 저작권 귀속은 현재 명확히 법적으로 정해져 있지 않습니다.", date: "2025.05.01", status: "미답변" },
//   { id: 2, question: "정부 AI 가이드라인 발표는 언제?", answer: "2025년 하반기 발표 예정입니다.", date: "2025.05.03", status: "승인" },
//   { id: 3, question: "정부 AI 가이드라인 발표는 언제?", answer: "", date: "2025.05.03", status: "승인" },
//   { id: 4, question: "생성형 AI 도입 시 기업이 주의할 점은?", answer: "", date: "2025.05.06", status: "미답변" },
//   { id: 5, question: "AI로 작성한 보고서의 저작권은 누구에게 있나요?", answer: "", date: "2025.05.05", status: "승인" },
//   { id: 6, question: "AI 기술 활용 관련 법적 이슈는?", answer: "", date: "2025.05.06", status: "미답변" },
//   { id: 7, question: "AI가 만든 디자인도 저작권이 있나요?", answer: "", date: "2025.05.07", status: "미답변" },
//   { id: 8, question: "이노베이션 아카데미가 정확히 무엇인지, 어떻게 신청하는지 궁금합니다.", answer: "", date: "2025.05.26", status: "미답변" },
// ];

//     setQuestions(dummyData);
//   }, []);

//   const filtered = questions
//     .filter((q) =>
//       q.question.toLowerCase().includes(searchParams.keyword.toLowerCase())
//     )
//     .filter((q) =>
//       searchParams.date ? q.date === searchParams.date : true
//     )
//     .sort((a, b) => {
//       if (searchParams.sort === '최근순') return b.date.localeCompare(a.date);
//       if (searchParams.sort === '오래된순') return a.date.localeCompare(b.date);
//       return 0;
//     });

//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

//   return (
//     <>
//       {currentItems.length > 0 ? (
//         currentItems.map((item) => <QuestionItem key={item.id} data={item} />)
//       ) : (
//         <p style={{ color: '#888' }}>🔍 검색 결과가 없습니다.</p>
//       )}
//       <Pagination
//         currentPage={currentPage}
//         totalItems={filtered.length}
//         itemsPerPage={itemsPerPage}
//         onPageChange={setCurrentPage}
//       />
//     </>
//   );
// };

// export default QuestionList;


//Backend 연동
// import React, { useEffect, useState } from "react";
// import QuestionItem from "./questionitem"; 
// import Pagination from "./Pagination"; 

// const QuestionList = ({ searchParams }) => {
//   const [questions, setQuestions] = useState([
//     { id: 1, question: "생성형 AI 콘텐츠 저작권 문제는?", answer: "생성형 AI가 만든 콘텐츠의 저작권 귀속은 현재 명확히 법적으로 정해져 있지 않습니다.", date: "2025.05.01", status: "미답변" },
//     { id: 2, question: "정부 AI 가이드라인 발표는 언제?", answer: "2025년 하반기 발표 예정입니다.", date: "2025.05.03", status: "승인" },
//     { id: 3, question: "정부 AI 가이드라인 발표는 언제?", answer: "", date: "2025.05.03", status: "승인" },
//     { id: 4, question: "생성형 AI 도입 시 기업이 주의할 점은?", answer: "", date: "2025.05.06", status: "미답변" },
//     { id: 5, question: "AI로 작성한 보고서의 저작권은 누구에게 있나요?", answer: "", date: "2025.05.05", status: "승인" },
//     { id: 6, question: "AI 기술 활용 관련 법적 이슈는?", answer: "", date: "2025.05.06", status: "미답변" },
//     { id: 7, question: "AI가 만든 디자인도 저작권이 있나요?", answer: "", date: "2025.05.07", status: "미답변" },
//     { id: 8, question: "이노베이션 아카데미가 정확히 무엇인지, 어떻게 신청하는지 궁금합니다.", answer: "null", date: "2025.05.26", status: "미답변" },
//   ]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   useEffect(() => {
//     const fetchAIAnswer = async () => {
//       if (
//         searchParams.keyword ===
//         "이노베이션 아카데미가 정확히 무엇인지, 어떻게 신청하는지 궁금합니다."
//       ) {
//         try {
//           const res = await fetch("http://localhost:8000/ask_query", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ question: searchParams.keyword }),
//           });
//           const aiData = await res.json();

//           setQuestions((prev) =>
//             prev.map((q) =>
//               q.id === 8
//                 ? {
//                     ...q,
//                     answer: aiData.answer,
//                     status: aiData.answer ? "승인" : "미답변",
//                   }
//                 : q
//             )
//           );
//         } catch (error) {
//           console.error("AI 답변 요청 실패:", error);
//         }
//       }
//     };

//     fetchAIAnswer();
//   }, [searchParams]);

//   const filtered = questions
//     .filter((q) =>
//       q.question.toLowerCase().includes(searchParams.keyword.toLowerCase())
//     )
//     .filter((q) => (searchParams.date ? q.date === searchParams.date : true))
//     .sort((a, b) => {
//       if (searchParams.sort === "최근순") return b.date.localeCompare(a.date);
//       if (searchParams.sort === "오래된순") return a.date.localeCompare(b.date);
//       return 0;
//     });

//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

//   return (
//     <>
//       {currentItems.length > 0 ? (
//         currentItems.map((item) => (
//           <QuestionItem key={item.id} data={item} />
//         ))
//       ) : (
//         <p style={{ color: "#888" }}>🔍 검색 결과가 없습니다.</p>
//       )}
//       <Pagination
//         currentPage={currentPage}
//         totalItems={filtered.length}
//         itemsPerPage={itemsPerPage}
//         onPageChange={setCurrentPage}
//       />
//     </>
//   );
// };

// export default QuestionList;

// import React, { useEffect, useState } from "react";
// import QuestionItem from "./questionitem";
// import Pagination from "./Pagination";

// const QuestionList = ({ searchParams }) => {
//   const [questions, setQuestions] = useState([
//     {
//       id: 1,
//       question: "생성형 AI 콘텐츠 저작권 문제는?",
//       answer: "생성형 AI가 만든 콘텐츠의 저작권 귀속은 현재 명확히 법적으로 정해져 있지 않습니다.",
//       date: "2025.05.01",
//       status: "승인",
//     },
//     {
//       id: 2,
//       question: "정부 AI 가이드라인 발표는 언제?",
//       answer: "2025년 하반기 발표 예정입니다.",
//       date: "2025.05.03",
//       status: "승인",
//     },
//     {
//       id: 3,
//       question: "생성형 AI 도입 시 기업이 주의할 점은?",
//       answer: "",
//       date: "2025.05.06",
//       status: "미답변",
//     },
//     {
//       id: 4,
//       question: "AI로 작성한 보고서의 저작권은 누구에게 있나요?",
//       answer: "",
//       date: "2025.05.05",
//       status: "미답변",
//     },
//     {
//       id: 5,
//       question: "AI 기술 활용 관련 법적 이슈는?",
//       answer: null,
//       date: "2025.05.06",
//       status: "미답변",
//     },
//     {
//       id: 6,
//       question: "이노베이션 아카데미가 무엇이고 어떻게 신청하나요?",
//       answer: "null",
//       date: "2025.05.26",
//       status: "미답변",
//     },
//   ]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   // 답변 없는 질문 자동으로 질의
//   useEffect(() => {
//     const fetchAnswers = async () => {
//       const updated = await Promise.all(
//         questions.map(async (q) => {
//           if (!q.answer || q.answer === "null") {
//             try {
//               const res = await fetch("http://localhost:8000/ask_query", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ question: q.question }),
//               });
//               const aiData = await res.json();
//               return {
//                 ...q,
//                 answer: aiData.answer,
//                 status: aiData.answer ? "승인" : "미답변",
//               };
//             } catch (err) {
//               console.error("AI 요청 실패:", err);
//               return q;
//             }
//           }
//           return q;
//         })
//       );
//       setQuestions(updated);
//     };

//     fetchAnswers();
//   }, []);

//   const filtered = questions
//     .filter((q) =>
//       q.question
//         .toLowerCase()
//         .includes((searchParams.keyword || "").toLowerCase())
//     )
//     .filter((q) => (searchParams.date ? q.date === searchParams.date : true))
//     .sort((a, b) => {
//       if (searchParams.sort === "최근순") return b.date.localeCompare(a.date);
//       if (searchParams.sort === "오래된순") return a.date.localeCompare(b.date);
//       return 0;
//     });

//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

//   return (
//     <>
//       {currentItems.length > 0 ? (
//         currentItems.map((item) => <QuestionItem key={item.id} data={item} />)
//       ) : (
//         <p style={{ color: "#888" }}>🔍 검색 결과가 없습니다.</p>
//       )}
//       {filtered.length > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalItems={filtered.length}
//           itemsPerPage={itemsPerPage}
//           onPageChange={setCurrentPage}
//         />
//       )}
//     </>
//   );
// };

// export default QuestionList;



import React, { useEffect, useState } from "react";
import QuestionItem from "./questionitem";
import Pagination from "./Pagination";

const QuestionList = ({ searchParams }) => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "생성형 AI 콘텐츠 저작권 문제는?",
      answer: "생성형 AI가 만든 콘텐츠의 저작권 귀속은 현재 명확히 법적으로 정해져 있지 않습니다.",
      date: "2025.05.01",
      status: "승인",
    },
    {
      id: 2,
      question: "정부 AI 가이드라인 발표는 언제?",
      answer: "2025년 하반기 발표 예정입니다.",
      date: "2025.05.03",
      status: "승인",
    },
    {
      id: 3,
      question: "생성형 AI 도입 시 기업이 주의할 점은?",
      answer: "",
      date: "2025.05.06",
      status: "미답변",
    },
    {
      id: 4,
      question: "AI로 작성한 보고서의 저작권은 누구에게 있나요?",
      answer: "",
      date: "2025.05.05",
      status: "미답변",
    },
    {
      id: 5,
      question: "AI 기술 활용 관련 법적 이슈는?",
      answer: null,
      date: "2025.05.06",
      status: "미답변",
    },
    {
      id: 6,
      question: "이노베이션 아카데미가 무엇이고 어떻게 신청하나요?",
      answer: "null",
      date: "2025.05.26",
      status: "미답변",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 🔄 AI 답변 자동 요청
  useEffect(() => {
    const fetchAnswers = async () => {
      const updated = await Promise.all(
        questions.map(async (q) => {
          const needsAnswer = !q.answer || q.answer === "null";
          if (!needsAnswer) return q;

          try {
            const res = await fetch("http://localhost:8000/ask_query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: q.question }),
            });

            const aiData = await res.json();

            const cleanAnswer = aiData.answer === "null" ? "" : aiData.answer;

            return {
              ...q,
              answer: cleanAnswer,
              status: q.status,
            };
          } catch (err) {
            console.error("❌ AI 요청 실패:", err);
            return q;
          }
        })
      );
      setQuestions(updated);
    };

    fetchAnswers();
  }, []);

  // 🔍 필터링 & 정렬
  const filtered = questions
    .filter((q) =>
      q.question
        .toLowerCase()
        .includes((searchParams.keyword || "").toLowerCase())
    )
    .filter((q) => (searchParams.date ? q.date === searchParams.date : true))
    .sort((a, b) => {
      if (searchParams.sort === "최근순") return b.date.localeCompare(a.date);
      if (searchParams.sort === "오래된순") return a.date.localeCompare(b.date);
      return 0;
    });

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      {currentItems.length > 0 ? (
        currentItems.map((item) => (
          <QuestionItem key={item.id} data={item} />
        ))
      ) : (
        <p style={{ color: "#888" }}>🔍 검색 결과가 없습니다.</p>
      )}

      {filtered.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default QuestionList;

