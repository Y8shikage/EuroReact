import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, message, type = 'info', confirmText = 'OK' }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon ${type}`}>
          {type === 'success' && '✓'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
          {type === 'warning' && '⚠'}
        </div>
        
        <h2 className="modal-title">{title}</h2>
        
        <p className="modal-message">{message}</p>
        
        <div className="modal-buttons">
          <button className="modal-btn modal-btn-primary" onClick={onClose}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

