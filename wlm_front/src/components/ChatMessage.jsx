import styles from './ChatMessage.module.css';

const ChatMessage = ({ user, message }) => (
  <div className={styles.chatMessage}>
    <span className={styles.user}>{user}:</span> {message}
  </div>
);

export default ChatMessage; 