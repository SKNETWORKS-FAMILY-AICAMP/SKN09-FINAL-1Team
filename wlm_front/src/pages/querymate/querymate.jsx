import React, { useState } from 'react';
import './css/querymate.css';
import Sidebar from './component/Sidebar';
import QuestionList from './component/QuestionList';
import MessageButton from '../../statics/chat_modal/component/MessageButton.jsx';

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
      <MessageButton />
    </div>
  );
};

export default QueryMate;
