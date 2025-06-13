import React, { useState, useEffect } from 'react';
import styles from '../css/SideBar.module.css';
import FilterPanel from './FilterPanel';



const Sidebar = ({ isOpen, setIsOpen, onSelectChat, refreshSidebar }) => {
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByKeyword, setFilterByKeyword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupedData, setGroupedData] = useState({});
  const [allChats, setAllChats] = useState([]);


  console.log(document.cookie)

  useEffect(() => {
    // const isLoggedIn = Boolean(document.cookie.includes("session="));
    // if (!isLoggedIn) return;

    fetch("/model/chat_list", {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setAllChats(data);
        setGroupedData(groupByDate(data));
      });
  }, [refreshSidebar]);


  const groupByDate = (items) => {
    return items.reduce((acc, item) => {
      const date = item.chat_create_dt;
      acc[date] = acc[date] || [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const normalizeDate = (dateStr) => dateStr.replace(/\./g, '-');

  useEffect(() => {
    let filtered = [...allChats];

    if (filterByDate) {
      filtered = filtered.filter(chat => {
        const chatDate = normalizeDate(chat.chat_create_dt);
        let ok = true;
        if (startDate) ok = ok && chatDate >= startDate;
        if (endDate) ok = ok && chatDate <= endDate;
        return ok;
      });
    }

    if (filterByKeyword && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.chat_title.toLowerCase().includes(lower)
      );
    }

    setGroupedData(groupByDate(filtered));
  }, [filterByDate, filterByKeyword, startDate, endDate, searchTerm, allChats]);

  const handleDeleteChat = async (chat_no) => {
    const confirmed = window.confirm("정말 이 채팅방을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/model/delete_chat_room?chat_no=${chat_no}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        alert("삭제 실패: " + (data?.detail || res.status));
        return;
      }

      // 삭제 성공 시 채팅 리스트 새로고침
      const updated = allChats.filter(chat => chat.chat_no !== chat_no);
      setAllChats(updated);
      setGroupedData(groupByDate(updated));
    } catch (err) {
      alert("오류 발생: " + err.message);
    }
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
              <summary className={styles.date}>
                {date}
              </summary>
              {chats.map((chat) => (
                <div key={chat.chat_no} className={styles.itemContainer}>
                  <div className={styles.item} title={chat.chat_title} onClick={() => onSelectChat(chat.chat_no)}>
                    {chat.chat_title}
                  <button className={styles.deleteButton} onClick={(e) => {e.stopPropagation(); handleDeleteChat(chat.chat_no);}}>
                    X
                  </button>
                  </div>
                </div>
              ))}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
