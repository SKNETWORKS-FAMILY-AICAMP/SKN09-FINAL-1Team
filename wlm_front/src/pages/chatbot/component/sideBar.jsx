import React, { useState, useEffect } from 'react';
import styles from '../css/SideBar.module.css';
import FilterPanel from './FilterPanel';



const Sidebar = ({ isOpen, setIsOpen, onSelectChat }) => {
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByKeyword, setFilterByKeyword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupedData, setGroupedData] = useState({});

  console.log(document.cookie)

  useEffect(() => {
    // const isLoggedIn = Boolean(document.cookie.includes("session="));
    // if (!isLoggedIn) return;

    fetch("http://localhost:8001/api/chat_list", {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const grouped = groupByDate(data);
        setGroupedData(grouped);
      });
  }, []);


  const groupByDate = (items) => {
    return items.reduce((acc, item) => {
      const date = item.chat_create_dt;
      acc[date] = acc[date] || [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '←' : '→'}
      </button>
      <div className={styles.sidebar + (!isOpen ? ` ${styles.closed}` : '')}>
        <h2 className={styles.title}>HISTORY</h2>

        <FilterPanel
          filterByDate={filterByDate}
          filterByKeyword={filterByKeyword}
          setFilterByDate={setFilterByDate}
          setFilterByKeyword={setFilterByKeyword}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <div className={styles.divider} />

        <div className={styles.resultSection}>
          {Object.entries(groupedData).map(([date, chats], index) => (
            <details key={index} className={styles.details} open>
              <summary className={styles.date}> {date}</summary>
              {chats.map((chat) => (
                <div key={chat.chat_no} className={styles.item} onClick={() => onSelectChat(chat.chat_no)}> {chat.chat_title}</div>
              ))}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
