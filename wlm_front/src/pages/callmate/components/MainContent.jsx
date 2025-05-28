// import React, { useState, useRef } from 'react';
// import styles from '../css/MainContent.module.css';

// const MainContent = ({ qaList, onDelete, onFeedback }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const fileInputRef = useRef(null);
//   const itemsPerPage = 5;

//   // 현재 페이지의 아이템들
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = qaList.slice(indexOfFirstItem, indexOfLastItem);

//   // 전체 페이지 수 계산
//   const totalPages = Math.ceil(qaList.length / itemsPerPage);

//   // 페이지 변경 핸들러
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     setSelectedAnswer(null);
//   };

//   // 답변 클릭 핸들러
//   const handleAnswerClick = (answer) => {
//     setSelectedAnswer(selectedAnswer === answer ? null : answer);
//   };

//   // 파일 업로드 핸들러
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type === 'audio/mpeg') {
//       // TODO: 여기에 파일 업로드 로직 추가
//       console.log('Uploaded file:', file.name);
//     } else {
//       alert('MP3 파일만 업로드 가능합니다.');
//     }
//   };

//   // 파일 다운로드 핸들러
//   const handleFileDownload = (fileName, fileType) => {
//     // TODO: 실제 다운로드 로직 구현
//     console.log('Downloading file:', fileName, 'Type:', fileType);
//   };

//   // 마지막 페이지 체크 및 조정
//   React.useEffect(() => {
//     const maxPage = Math.ceil(qaList.length / itemsPerPage);
//     if (currentPage > maxPage && maxPage > 0) {
//       setCurrentPage(maxPage);
//     }
//   }, [qaList.length, currentPage, itemsPerPage]);

//   return (
//     <div className={styles.mainContent}>
//       <div className={styles.contentWrapper}>
//         <div className={styles.headerSection}>
//           <h2 className={styles.title}>QA리스트</h2>
//           <div className={styles.uploadSection}>
//             <input
//               type="file"
//               accept=".mp3"
//               onChange={handleFileUpload}
//               ref={fileInputRef}
//               style={{ display: 'none' }}
//             />
//             <button 
//               className={styles.uploadButton}
//               onClick={() => fileInputRef.current.click()}
//             >
//               MP3 업로드
//             </button>
//           </div>
//         </div>
//         <div className={styles.qaList}>
//           {currentItems.length > 0 ? (
//             currentItems.map((qa) => (
//               <div key={qa.id} className={styles.qaItem}>
//                 <div className={styles.qaHeader}>
//                   <h3 className={styles.qaQuestion}>Q: {qa.question}</h3>
//                   <div className={styles.qaHeaderRight}>
//                     <span className={styles.qaDate}>{qa.date}</span>
//                   </div>
//                 </div>
//                 <div className={styles.tagList}>
//                   {qa.tags.map((tag, index) => (
//                     <span key={index} className={styles.tag}>#{tag}</span>
//                   ))}
//                 </div>
//                 <p 
//                   className={`${styles.qaAnswer} ${selectedAnswer === qa.answer ? styles.expanded : ''}`}
//                   onClick={() => handleAnswerClick(qa.answer)}
//                 >
//                   A: {qa.answer}
//                 </p>
//                 {selectedAnswer === qa.answer && (
//                   <div className={styles.expandedInfo}>
//                     <div className={styles.fileInfo}>
//                       <div className={styles.fileRow}>
//                         <span className={styles.fileLabel}>음성 파일: </span>
//                         <button 
//                           className={styles.fileLink}
//                           onClick={() => handleFileDownload(qa.audioFileName, 'audio')}
//                         >
//                           {qa.audioFileName || 'audio_file.mp3'}
//                         </button>
//                       </div>
//                       <div className={styles.fileRow}>
//                         <span className={styles.fileLabel}>원본 텍스트: </span>
//                         <button 
//                           className={styles.fileLink}
//                           onClick={() => handleFileDownload(qa.textFileName, 'text')}
//                         >
//                           {qa.textFileName || 'text_file.txt'}
//                         </button>
//                       </div>
//                     </div>
//                     {qa.feedback && (
//                       <div className={styles.feedbackSection}>
//                         <div className={styles.feedbackHeader}>
//                           <span className={styles.feedbackLabel}>F: 피드백</span>
//                         </div>
//                         <p className={styles.feedbackText}>{qa.feedback}</p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 <div className={styles.qaActions}>
//                   <button 
//                     className={`${styles.actionButton} ${styles.deleteButton}`}
//                     onClick={() => onDelete(qa.id)}
//                   >
//                     삭제
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className={styles.noResults}>
//               검색 결과가 없습니다.
//             </div>
//           )}
//         </div>
//         {qaList.length > 0 && (
//           <div className={styles.pagination}>
//             <button 
//               className={styles.pageButton} 
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               이전
//             </button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
//               <button
//                 key={number}
//                 className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ''}`}
//                 onClick={() => handlePageChange(number)}
//               >
//                 {number}
//               </button>
//             ))}
//             <button 
//               className={styles.pageButton} 
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               다음
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MainContent; 
import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/MainContent.module.css';

const MainContent = () => {
  const [qaList, setQaList] = useState([]); // Q&A 리스트
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const itemsPerPage = 5;

  // 파일 업로드 핸들러
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'audio/mpeg') {
      alert('MP3 파일만 업로드 가능합니다.');
      return;
    }

    setLoading(true);
    setQaList([]); // 업로드 시 기존 리스트 초기화

    // 서버로 파일 업로드
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8001/upload_audio', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.qna && Array.isArray(data.qna)) {
        setQaList(
          data.qna.map((qna, idx) => ({
            id: idx + 1,
            question: qna.question,
            answer: qna.answer,
            date: new Date().toISOString().slice(0, 10),
            tags: [], // 필요시 태그 추가
          }))
        );
        setCurrentPage(1);
      } else {
        alert('Q&A 추출 실패');
      }
    } catch (e) {
      alert('업로드 실패: ' + e.message);
    }
    setLoading(false);
  };

  // 현재 페이지의 아이템들
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = qaList.slice(indexOfFirstItem, indexOfLastItem);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(qaList.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedAnswer(null);
  };

  // 답변 클릭 핸들러
  const handleAnswerClick = (answer) => {
    setSelectedAnswer(selectedAnswer === answer ? null : answer);
  };

  // 삭제 핸들러
  const handleDelete = (id) => {
    setQaList((prev) => prev.filter((qa) => qa.id !== id));
  };

  // 마지막 페이지 체크 및 조정
  useEffect(() => {
    const maxPage = Math.ceil(qaList.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [qaList.length, currentPage, itemsPerPage]);

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}>QA리스트</h2>
          <div className={styles.uploadSection}>
            <input
              type="file"
              accept=".mp3"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              className={styles.uploadButton}
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
            >
              {loading ? '업로드 중...' : 'MP3 업로드'}
            </button>
          </div>
        </div>
        <div className={styles.qaList}>
          {loading ? (
            <div className={styles.noResults}>Q&A 추출 중입니다...</div>
          ) : currentItems.length > 0 ? (
            currentItems.map((qa) => (
              <div key={qa.id} className={styles.qaItem}>
                <div className={styles.qaHeader}>
                  <h3 className={styles.qaQuestion}>Q: {qa.question}</h3>
                  <div className={styles.qaHeaderRight}>
                    <span className={styles.qaDate}>{qa.date}</span>
                  </div>
                </div>
                <div className={styles.tagList}>
                  {qa.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
                <p 
                  className={`${styles.qaAnswer} ${selectedAnswer === qa.answer ? styles.expanded : ''}`}
                  onClick={() => handleAnswerClick(qa.answer)}
                >
                  A: {qa.answer}
                </p>
                {selectedAnswer === qa.answer && (
                  <div className={styles.expandedInfo}>
                    {/* 필요시 파일정보, 피드백 등 추가 */}
                  </div>
                )}
                <div className={styles.qaActions}>
                  <button 
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDelete(qa.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              검색 결과가 없습니다.
            </div>
          )}
        </div>
        {qaList.length > 0 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageButton} 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ''}`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            ))}
            <button 
              className={styles.pageButton} 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
