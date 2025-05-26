import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import styles from './css/Callmate.module.css';

const Callmate = () => {
  // 전체 QA 데이터
  const [qaData, setQaData] = useState([
    {
      "id": 1,
      "question": "생성형 AI 콘텐츠 저작권 문제는?",
      "tags": ["AI", "저작권", "법적기준"],
      "date": "2025.05.01",
      "answer": "현재 국내에서는 생성형 AI 콘텐츠의 저작권 확보에 대한 명확한 법적 기준이 마련되진 않았습니다..., 현재 국내에서는 생성형 AI 콘텐츠의 저작권 확보에 대한 명확한 법적 기준이 마련되진 않았습니다..., 현재 국내에서는 생성형 AI 콘텐츠의 저작권 확보에 대한 명확한 법적 기준이 마련되진 않았습니다...",
      "feedback": "답변에서 구체적인 사례나 현재 진행 중인 법적 논의 사항을 추가하면 좋겠습니다.",
      "isApproved": false,
      "audioFileName": "qa_audio_1.mp3",
      "textFileName": "qa_text_1.txt",
      "originalText": "현재 국내에서는 생성형 AI 콘텐츠의 저작권 확보에 대한 명확한 법적 기준이 마련되진 않았습니다..."
    },
    {
      "id": 2,
      "question": "AI 생성 콘텐츠 분쟁 방지 방법은?",
      "tags": ["AI", "콘텐츠", "저작권예방"],
      "date": "2025.05.01",
      "answer": "첫째, 이용약관을 확인하고, 둘째, 저작권 침해 가능성을 검토하며...",
      "feedback": "구체적인 예방 방법과 체크리스트 형태로 정리하면 더 좋을 것 같습니다.",
      "isApproved": false,
      "audioFileName": "qa_audio_2.mp3",
      "textFileName": "qa_text_2.txt",
      "originalText": "첫째, 이용약관을 확인하고, 둘째, 저작권 침해 가능성을 검토하며..."
    },
    {
      "id": 3,
      "question": "정부의 생성형 AI 가이드라인 발표 시점은?",
      "tags": ["정부정책", "가이드라인", "2025년"],
      "date": "2025.05.03",
      "answer": "과기정통부와 문체부는 2025년 하반기 내로 공식적인 가이드라인을 발표할 예정입니다...",
      "feedback": "발표 예정인 가이드라인의 주요 내용이나 예상되는 규제 사항도 함께 설명하면 좋겠습니다.",
      "isApproved": false,
      "audioFileName": "qa_audio_3.mp3",
      "textFileName": "qa_text_3.txt",
      "originalText": "과기정통부와 문체부는 2025년 하반기 내로 공식적인 가이드라인을 발표할 예정입니다..."
    },
    {
        "id": 4,
        "question": "AI로 만든 이미지에 저작권이 인정되나요?",
        "tags": ["AI", "이미지", "저작권"],
        "date": "2025.05.05",
        "answer": "현재 국내법상 인간의 창작물이 아닌 AI 단독 생성물은 저작권 보호 대상이 아닙니다. 단, 인간이 창작 과정에 실질적으로 개입한 경우 일부 보호 가능성이 있습니다.",
        "feedback": "AI와 인간의 협업 과정에서 발생하는 저작권 인정 기준을 더 자세히 설명해주세요.",
        "isApproved": false,
        "audioFileName": "qa_audio_4.mp3",
        "textFileName": "qa_text_4.txt",
        "originalText": "현재 국내법상 인간의 창작물이 아닌 AI 단독 생성물은 저작권 보호 대상이 아닙니다..."
    },
    {
        "id": 5,
        "question": "AI 학습 데이터에 타인의 저작물이 포함된 경우 문제는?",
        "tags": ["AI", "데이터", "저작권침해"],
        "date": "2025.05.06",
        "answer": "타인의 저작물을 무단으로 AI 학습에 활용할 경우, 저작권 침해로 간주될 수 있으며 이에 대한 법적 책임이 발생할 수 있습니다.",
        "feedback": "실제 발생했던 저작권 침해 사례와 해결 방안을 추가하면 좋겠습니다.",
        "isApproved": false,
        "audioFileName": "qa_audio_5.mp3",
        "textFileName": "qa_text_5.txt",
        "originalText": "타인의 저작물을 무단으로 AI 학습에 활용할 경우, 저작권 침해로 간주될 수 있으며..."
    },
    {
        "id": 6,
        "question": "AI 생성 텍스트를 상업적으로 사용해도 되나요?",
        "tags": ["AI", "텍스트", "상업적이용"],
        "date": "2025.05.06",
        "answer": "AI 서비스 제공자의 이용약관에 따라 다르며, 대부분의 경우 상업적 이용이 가능하나, 이용 시 출처 명시나 책임 제한 조건을 확인해야 합니다.",
        "feedback": "주요 AI 서비스별 상업적 이용 조건을 비교 표로 정리해주면 좋겠습니다.",
        "isApproved": false,
        "audioFileName": "qa_audio_6.mp3",
        "textFileName": "qa_text_6.txt",
        "originalText": "AI 서비스 제공자의 이용약관에 따라 다르며, 대부분의 경우 상업적 이용이 가능하나..."
    },
    {
        "id": 7,
        "question": "AI가 표절한 콘텐츠 생성 시 누가 책임지나요?",
        "tags": ["AI", "표절", "법적책임"],
        "date": "2025.05.07",
        "answer": "AI를 이용한 사용자가 최종적으로 콘텐츠를 배포한 경우, 그 사용자가 법적 책임을 질 가능성이 높습니다. 특히 표절 여부를 검토하지 않은 경우 주의가 필요합니다.",
        "feedback": "AI 서비스 제공자와 사용자 간의 책임 범위를 구체적으로 구분하여 설명해주세요.",
        "isApproved": false,
        "audioFileName": "qa_audio_7.mp3",
        "textFileName": "qa_text_7.txt",
        "originalText": "AI를 이용한 사용자가 최종적으로 콘텐츠를 배포한 경우, 그 사용자가 법적 책임을 질 가능성이 높습니다..."
    },
    {
        "id": 8,
        "question": "국내외 생성형 AI 관련 법안 현황은?",
        "tags": ["AI", "법안", "국제비교"],
        "date": "2025.05.08",
        "answer": "유럽연합은 AI 법안(AI Act)을 통해 AI 생성물에 대한 규제를 구체화하고 있으며, 한국도 이를 참고하여 국내 가이드라인 및 제도 정비를 추진 중입니다.",
        "feedback": "주요국의 AI 관련 법안을 비교 분석하고 시사점을 도출해주세요.",
        "isApproved": false,
        "audioFileName": "qa_audio_8.mp3",
        "textFileName": "qa_text_8.txt",
        "originalText": "유럽연합은 AI 법안(AI Act)을 통해 AI 생성물에 대한 규제를 구체화하고 있으며..."
    }
  ]);

  // 검색 조건 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchType, setSearchType] = useState('all');

  // 승인 핸들러
  const handleApprove = (id) => {
    if (window.confirm('이 항목을 승인하시겠습니까?\n승인 후에는 삭제할 수 없습니다.')) {
      setQaData(prevData => 
        prevData.map(item => 
          item.id === id 
            ? { ...item, isApproved: true, approvedDate: new Date().toLocaleDateString('ko-KR') }
            : item
        )
      );
    }
  };

  // 삭제 핸들러
  const handleDelete = (id) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      setQaData(prevData => prevData.filter(item => item.id !== id));
    }
  };

  // 피드백 추가/수정 핸들러
  const handleFeedback = (id, feedback) => {
    setQaData(prevData =>
      prevData.map(item =>
        item.id === id
          ? { ...item, feedback }
          : item
      )
    );
  };

  // 필터링된 QA 데이터
  const filteredQaData = qaData.filter(qa => {
    const keyword = searchKeyword.toLowerCase();
    
    let matchesKeyword = true;
    if (searchKeyword !== '') {
      switch (searchType) {
        case 'tag':
          matchesKeyword = qa.tags.some(tag => 
            tag.toLowerCase().includes(keyword)
          );
          break;
        case 'question':
          matchesKeyword = qa.question.toLowerCase().includes(keyword);
          break;
        case 'all':
        default:
          matchesKeyword = qa.tags.some(tag => 
            tag.toLowerCase().includes(keyword)
          ) || qa.question.toLowerCase().includes(keyword);
          break;
      }
    }
    
    const matchesDate = searchDate === '' || qa.date === searchDate;

    return matchesKeyword && matchesDate;
  });

  // 검색 핸들러
  const handleSearch = (keyword, date, type) => {
    setSearchKeyword(keyword);
    setSearchDate(date);
    setSearchType(type);
  };

  return (
    <div className={styles.callmateContainer}>
      <div className={styles.callmateWrapper}>
        <Sidebar onSearch={handleSearch} />
        <MainContent 
          qaList={filteredQaData}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onFeedback={handleFeedback}
        />
      </div>
    </div>
  );
};

export default Callmate; 