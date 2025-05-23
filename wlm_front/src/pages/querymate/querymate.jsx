import React from 'react';
import './css/querymate.css';
import Sidebar from './component/Sidebar';
import QuestionList from './component/questionlist';

const QueryMate = () => {
  return (
    <div className="querymate-container">
      <Sidebar />
      <div className="main-content">
        <h2>📋 민원 질문 목록</h2>
        <QuestionList />
      </div>
    </div>
  );
};

export default QueryMate;
