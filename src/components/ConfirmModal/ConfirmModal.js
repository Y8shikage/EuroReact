import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Удалить', cancelText = 'Отмена' }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h2>{title}</h2>
          <button className="confirm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-btn-delete" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

