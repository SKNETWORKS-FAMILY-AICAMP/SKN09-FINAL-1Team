import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/MainContent.module.css';

const MainContent = ({ searchParams }) => {
  const [qaList, setQaList] = useState([]);
  const [filteredQAList, setFilteredQAList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const itemsPerPage = 5;

  // Blob URL 정리를 위한 cleanup
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 모든 Blob URL 해제
      qaList.forEach(qa => {
        if (qa.audioBlobUrl) {
          URL.revokeObjectURL(qa.audioBlobUrl);
        }
      });
    };
  }, [qaList]);

  // 검색 조건에 따른 필터링
  useEffect(() => {
    let filtered = [...qaList];

    // 키워드 검색 필터링
    if (searchParams?.keyword) {
      filtered = filtered.filter(qa => {
        if (searchParams.type === 'tag') {
          return qa.tags?.some(tag => tag.toLowerCase().includes(searchParams.keyword.toLowerCase()));
        } else if (searchParams.type === 'question') {
          return qa.question.toLowerCase().includes(searchParams.keyword.toLowerCase());
        } else {
          // 전체 검색
          return qa.question.toLowerCase().includes(searchParams.keyword.toLowerCase()) ||
            qa.tags?.some(tag => tag.toLowerCase().includes(searchParams.keyword.toLowerCase()));
        }
      });
    }

    // 날짜 범위 필터링
    if (searchParams?.startDate || searchParams?.endDate) {
      filtered = filtered.filter(qa => {
        const qaDate = new Date(qa.date);
        qaDate.setHours(0, 0, 0, 0);

        if (searchParams.startDate) {
          const startDate = new Date(searchParams.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (qaDate < startDate) return false;
        }

        if (searchParams.endDate) {
          const endDate = new Date(searchParams.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (qaDate > endDate) return false;
        }

        return true;
      });
    }

    setFilteredQAList(filtered);
    setCurrentPage(1); // 검색 결과가 변경될 때 첫 페이지로 이동
  }, [searchParams, qaList]);

  // 파일 업로드 핸들러
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'audio/mpeg') {
      alert('MP3 파일만 업로드 가능합니다.');
      return;
    }

    setLoading(true);

    // 서버로 파일 업로드
    const formData = new FormData();
    formData.append('file', file);

    // 파일 이름에서 확장자 제거
    const fileName = file.name.replace('.mp3', '');

    // 파일을 Blob URL로 저장
    const audioBlobUrl = URL.createObjectURL(file);

    // model 서버로 파일 업로드
    try {
      const res = await fetch('/model/upload_audio', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.qna && Array.isArray(data.qna)) {
        const qaListData = data.qna.map((qna, idx) => ({
          id: idx + 1,
          question: qna.question,
          answer: qna.answer,
          date: new Date().toISOString().slice(0, 10),
          tags: [], // 필요시 태그 추가
          feedback: qna.feedback,
          audioFileName: file.name, // 실제 업로드된 파일 이름 저장
          audioBlobUrl: audioBlobUrl, // Blob URL 저장
        }));

        // Q&A 데이터를 서버에 저장
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('call_data', JSON.stringify({
            file_name: file.name,
            qna_list: data.qna
          }));

          const saveResponse = await fetch('/api/call/save_call_info', {
            method: 'POST',
            body: formData,
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.detail || 'Q&A 데이터 저장 실패');
          }

          await fetch('/model/create_vectors?collection_name=wlmmate_call', {
            method: 'POST'
          })

          // 기존 데이터에 새 데이터 추가
          setQaList(prev => [
            ...prev,
            ...qaListData
          ]);
          setCurrentPage(1);
        } catch (saveError) {
          console.error('Q&A 데이터 저장 중 오류:', saveError);
          alert(saveError.message || 'Q&A 데이터 저장 중 오류가 발생했습니다.');
        }
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
  const currentItems = filteredQAList?.slice(indexOfFirstItem, indexOfLastItem) || [];

  // 전체 페이지 수 계산
  const totalPages = Math.ceil((filteredQAList?.length || 0) / itemsPerPage);

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
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/delete_call_data/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('삭제 실패');

      await fetch(`/model/delete_vector_by_id?collection_name=wlmmate_call&point_id=${id}`, {
        method: 'DELETE',
      });
      
      setQaList((prev) => prev.filter((qa) => qa.id !== id));
    } catch (err) {
      alert('삭제 중 오류 발생');
    }
  };

  // 마지막 페이지 체크 및 조정
  useEffect(() => {
    const maxPage = Math.ceil(filteredQAList.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [filteredQAList.length, currentPage, itemsPerPage]);

  useEffect(() => {
    // 컴포넌트 마운트 시 DB에서 Q&A 데이터 불러오기
    const fetchDBData = async () => {
      try {
        const res = await fetch('/api/call_datas');
        if (!res.ok) throw new Error('DB 데이터 불러오기 실패');
        const dbData = await res.json();
        // dbData를 qaListData 형식으로 변환
        const formatted = dbData.map((item, idx) => ({
          id: item.id || item.coun_no || idx + 1,
          question: item.question || item.coun_question,
          answer: item.answer || item.coun_answer,
          date: item.date || item.call_create_dt || new Date().toISOString().slice(0, 10),
          tags: item.tags || [],
          feedback: item.feedback || item.coun_feedback,
          audioFileName: item.audioFileName || item.call_path?.split('/')?.pop() || '',
          audioBlobUrl: null,
        }));
        setQaList(formatted);
      } catch (err) {
        console.error('DB 데이터 불러오기 오류:', err);
      }
    };
    fetchDBData();
  }, []);

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}>📋 전화 관리 목록</h2>
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
                <div
                  className={`${styles.answerSection} ${selectedAnswer === qa.answer ? styles.expanded : ''}`}
                  onClick={() => handleAnswerClick(qa.answer)}
                >
                  <div className={styles.answerHeader}>
                    <span className={styles.answerLabel}>A:</span>
                  </div>
                  <p className={styles.answerText}>
                    {qa.answer}
                  </p>
                </div>
                {selectedAnswer === qa.answer && (
                  <div className={styles.expandedInfo}>
                    <div className={styles.additionalInfo}>
                      <div className={styles.fileInfoContainer}>
                        <div className={styles.fileInfoItem}>
                          <div className={styles.fileInfoRow}>
                            <strong>음성 파일:</strong>
                            <a
                              href={qa.audioBlobUrl ? qa.audioBlobUrl : `/call_data/audios/${qa.audioFileName}`}
                              download={qa.audioFileName}
                              className={styles.downloadLink}
                            >
                              {qa.audioFileName}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className={styles.feedbackInfo}>
                        <p><strong>피드백:</strong> {qa.feedback}</p>
                      </div>
                    </div>
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
        {filteredQAList.length > 0 && (
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
                className={`
                  ${styles.pageButton} 
                  ${currentPage === number ? styles.activePage : styles.inactivePage}
                `}
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
