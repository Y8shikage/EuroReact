import React, { useState } from 'react';
import './RejectModal.css';

function RejectModal({ isOpen, onClose, onConfirm, videoName }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <div className="reject-modal-overlay" onClick={handleClose}>
      <div className="reject-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="reject-modal-header">
          <h2>Отклонить видео</h2>
        </div>
        <div className="reject-modal-body">
          <p className="reject-modal-video-name">
            Вы уверены, что хотите отклонить видео <strong>"{videoName}"</strong>?
          </p>
          <div className="reject-modal-input-group">
            <label htmlFor="reject-reason">Причина отклонения (необязательно)</label>
            <textarea
              id="reject-reason"
              placeholder="Укажите причину отклонения..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="reject-modal-footer">
          <button className="reject-btn-cancel" onClick={handleClose}>
            Отмена
          </button>
          <button className="reject-btn-confirm" onClick={handleConfirm}>
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;

