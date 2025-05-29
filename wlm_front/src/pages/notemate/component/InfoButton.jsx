import React from 'react';
import '../css/InfoButton.css';

const InfoButton = ({ onClick }) => (
  <button className="info-btn" onClick={onClick} aria-label="진행 방식 안내">
    !
  </button>
);

export default InfoButton; 