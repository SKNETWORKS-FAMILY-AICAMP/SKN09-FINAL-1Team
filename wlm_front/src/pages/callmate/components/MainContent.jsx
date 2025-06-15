import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/MainContent.module.css';

const MainContent = ({ searchParams }) => {
  // 예시 QA 리스트 데이터
  // const sampleQAList = [
  //   {
  //     id: 1,
  //     question: "프로젝트의 주요 목표는 무엇인가요?",
  //     answer: "이 프로젝트의 주요 목표는 업무 효율성 향상과 직원 만족도 개선입니다. 구체적으로 워크플로우 자동화, 실시간 협업 도구 도입, 그리고 데이터 기반 의사결정 시스템 구축을 통해 달성할 계획입니다.",
  //     date: "2025-05-05",
  //     tags: ["프로젝트", "목표", "효율성"],
  //     feedback: "구체적인 수치 목표와 타임라인을 추가하면 좋겠습니다.",
  //     audioFileName: "qa_audio_1.mp3",
  //     textFileName: "qa_text_1.txt"
  //   },
  //   {
  //     id: 2,
  //     question: "개발 일정은 어떻게 되나요?",
  //     answer: "전체 개발 기간은 3개월로 예상됩니다. 1단계는 요구사항 분석과 설계(2주), 2단계는 핵심 기능 개발(6주), 3단계는 테스트와 버그 수정(4주)입니다. 각 단계별로 중간 검토회의를 진행할 예정입니다.",
  //     date: "2025-05-21",
  //     tags: ["개발일정", "계획"],
  //     feedback: "각 단계별 위험 요소와 대응 방안도 포함하면 좋겠습니다.",
  //     audioFileName: "qa_audio_2.mp3",
  //     textFileName: "qa_text_2.txt"
  //   },
  //   {
  //     id: 3,
  //     question: "필요한 개발 인력은 몇 명인가요?",
  //     answer: "총 5명의 개발 인력이 필요합니다. 프론트엔드 개발자 2명, 백엔드 개발자 2명, 그리고 DevOps 엔지니어 1명입니다. 추가로 UI/UX 디자이너와의 협업도 필요할 것으로 예상됩니다.",
  //     date: "2024-02-21",
  //     tags: ["인력", "채용", "개발팀"],
  //     feedback: "각 포지션별 필요한 기술 스택과 경력 요건을 상세히 기술해주세요.",
  //     audioFileName: "qa_audio_3.mp3",
  //     textFileName: "qa_text_3.txt"
  //   },
  //   {
  //     id: 4,
  //     question: "사용할 기술 스택은 무엇인가요?",
  //     answer: "프론트엔드는 React와 TypeScript, 백엔드는 FastAPI와 Python, 데이터베이스는 PostgreSQL을 사용할 예정입니다. 배포는 Docker와 Kubernetes를 활용할 계획입니다.",
  //     date: "2024-02-22",
  //     tags: ["기술", "개발환경"],
  //     feedback: "각 기술 선택의 이유와 대체 가능한 기술도 함께 설명해주세요.",
  //     audioFileName: "qa_audio_4.mp3",
  //     textFileName: "qa_text_4.txt"
  //   },
  //   {
  //     id: 5,
  //     question: "예상되는 주요 위험 요소는 무엇인가요?",
  //     answer: "1. 타이트한 개발 일정, 2. 레거시 시스템과의 통합 문제, 3. 보안 요구사항 충족 등이 주요 위험 요소입니다. 이를 위해 철저한 사전 검토와 리스크 관리 계획을 수립할 예정입니다.",
  //     date: "2024-02-22",
  //     tags: ["위험관리", "계획"],
  //     feedback: "각 위험 요소별 구체적인 대응 전략과 우선순위를 명시해주세요.",
  //     audioFileName: "qa_audio_5.mp3",
  //     textFileName: "qa_text_5.txt"
  //   },
  //   {
  //     id: 6,
  //     question: "품질 관리는 어떻게 진행되나요?",
  //     answer: "자동화된 테스트 시스템 구축, 코드 리뷰 프로세스 도입, 그리고 정기적인 품질 미팅을 통해 관리할 예정입니다. 특히 단위 테스트 커버리지 80% 이상을 목표로 하고 있습니다.",
  //     date: "2024-02-23",
  //     tags: ["품질관리", "테스트"],
  //     feedback: "품질 지표의 측정 방법과 개선 프로세스를 구체적으로 설명해주세요.",
  //     audioFileName: "qa_audio_6.mp3",
  //     textFileName: "qa_text_6.txt"
  //   },
  //   {
  //     id: 7,
  //     question: "유지보수 계획은 어떻게 되나요?",
  //     answer: "출시 후 6개월간 집중 유지보수 기간을 가질 예정입니다. 24/7 모니터링 시스템 구축, 정기 업데이트 일정 수립, 그리고 사용자 피드백을 반영한 지속적인 개선을 진행할 계획입니다.",
  //     date: "2024-02-23",
  //     tags: ["유지보수", "계획", "피드백"],
  //     feedback: "유지보수 인력 구성과 비용 산정 내역을 추가해주세요.",
  //     audioFileName: "qa_audio_7.mp3",
  //     textFileName: "qa_text_7.txt"
  //   }
  // ];

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
    setQaList([]); // 업로드 시 기존 리스트 초기화
    setFilteredQAList([]); // 필터링된 리스트도 초기화

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

          setQaList(qaListData);
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
  const handleDelete = (id) => {
    setQaList((prev) => prev.filter((qa) => qa.id !== id));
  };

  // 마지막 페이지 체크 및 조정
  useEffect(() => {
    const maxPage = Math.ceil(filteredQAList.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [filteredQAList.length, currentPage, itemsPerPage]);

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}>CALL MANAGEMENT LIST</h2>
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
                              href={qa.audioBlobUrl}
                              download={qa.audioFileName}
                              className={styles.downloadLink}
                            >
                              {qa.audioFileName}
                            </a>
                          </div>
                          <div className={styles.fileInfoRow}>
                            <strong>원본 텍스트:</strong>
                            <a
                              href={`/api/download/${qa.textFileName}`}
                              download={qa.textFileName}
                              className={styles.downloadLink}
                            >
                              {qa.textFileName}
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
