import styles from './MainContent.module.css';

const MainContent = () => (
  <div className={styles.mainContent}>
    <div className={styles.title}>AI 답변</div>
    <div className={styles.answerBox}>
      여기에 AI의 답변이 표시됩니다.
    </div>
  </div>
);

export default MainContent; 