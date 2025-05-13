import React from 'react';
import '../css/sideBar.css';

const Sidebar = ({ history, onSelect }) => {
  return (
    <div className="sidebar">
      <h3>최근 기록</h3>
      {history.length === 0 && <div className="empty">기록 없음</div>}
      {history.map((item, idx) => (
        <div
          key={idx}
          className="history-item"
          onClick={() => onSelect(item.session)}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
