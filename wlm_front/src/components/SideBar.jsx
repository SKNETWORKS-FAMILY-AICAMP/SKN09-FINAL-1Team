import ChatMessage from './ChatMessage';
import styles from './SideBar.module.css';

const chatHistory = [
  { id: 1, user: "나", message: "안녕, AI야!" },
  { id: 2, user: "AI", message: "안녕하세요! 무엇을 도와드릴까요?" },
  { id: 3, user: "나", message: "오늘 날씨 어때?" },
  { id: 4, user: "AI", message: "오늘은 맑고 따뜻한 날씨입니다." }
];

const SideBar = () => (
  <div className={styles.sideBar}>
    <div className={styles.title}>채팅 내역</div>
    {chatHistory.map(chat => (
      <ChatMessage key={chat.id} user={chat.user} message={chat.message} />
    ))}
  </div>
);

export default SideBar; 