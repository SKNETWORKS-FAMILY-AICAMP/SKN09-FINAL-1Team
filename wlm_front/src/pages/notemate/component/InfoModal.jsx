import React from 'react';
import '../css/InfoModal.css';

const InfoModal = ({ open, onClose, children, position }) => {
    if (!open) return null;
    return (
        <div className="info-modal-overlay">
            <div className="info-modal" style={position ? { top: position.top, left: position.left } : {}}>
                <button className="info-modal-close" onClick={onClose}>&times;</button>
                <div className="info-modal-content">{children}</div>
            </div>
        </div>
    );
};

export default InfoModal; 