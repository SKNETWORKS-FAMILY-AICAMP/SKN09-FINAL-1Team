import React, { useState } from 'react';
import './css/querymate.css';
import Sidebar from './component/Sidebar';
import QuestionList from './component/QuestionList';

const QueryMate = () => {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    dateRange: null,
    status: '전체'
  });

  return (
    <div className="querymate-container">
      <Sidebar setSearchParams={setSearchParams} />
      <div className="main-content">
        <QuestionList searchParams={searchParams} />
      </div>
    </div>
  );
};

export default QueryMate;
