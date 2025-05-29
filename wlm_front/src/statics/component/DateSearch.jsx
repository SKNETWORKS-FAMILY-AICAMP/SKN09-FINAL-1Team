import React, { useState } from 'react';
import styles from '../css/DateSearch.module.css';

const DateSearch = ({ onSearch, onReset }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSearch = () => {
        if (!startDate || !endDate) {
            alert('시작일과 종료일을 모두 선택해주세요.');
            return;
        }
        
        if (startDate > endDate) {
            alert('종료일은 시작일보다 늦은 날짜여야 합니다.');
            return;
        }

        console.log('DateSearch handleSearch:', { startDate, endDate });
        onSearch({ startDate, endDate });
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        onReset();
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        console.log('Start date changed:', newStartDate);
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        console.log('End date changed:', newEndDate);
        setEndDate(newEndDate);
    };

    return (
        <div className={styles.dateSearchContainer}>
            <h3 className={styles.title}>📅 날짜 검색</h3>
            <div className={styles.searchBox}>
                <div className={styles.dateInputs}>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className={styles.dateInput}
                    />
                    <span className={styles.dateDivider}>~</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className={styles.dateInput}
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <button 
                        onClick={handleSearch}
                        className={styles.searchButton}
                    >
                        날짜 적용
                    </button>
                    <button 
                        onClick={handleReset}
                        className={styles.resetButton}
                    >
                        전체보기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateSearch; 