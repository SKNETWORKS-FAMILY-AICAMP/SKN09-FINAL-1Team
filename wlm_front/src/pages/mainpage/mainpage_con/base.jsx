import React from 'react';
import Mainpage from '../component/mainpage.jsx';
import styles from './base.module.css';

function Base() {
  return (
    <div className={styles.container}>
      <Mainpage />
    </div>
  );
}

export default Base;