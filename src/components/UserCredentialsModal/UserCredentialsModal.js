import React, { useState } from 'react';
import './UserCredentialsModal.css';

const UserCredentialsModal = ({ isOpen, onClose, username, password, role }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState({ username: false, password: false });

  if (!isOpen) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="credentials-modal-overlay" onClick={handleOverlayClick}>
      <div className="credentials-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="credentials-modal-icon success">
          ✓
        </div>
        
        <h2 className="credentials-modal-title">Пользователь создан!</h2>
        
        <div className="credentials-info">
          <div className="credential-item">
            <label>Логин:</label>
            <div className="credential-value">
              <span className="credential-text">{username}</span>
              <button 
                className="btn-copy"
                onClick={() => handleCopy(username, 'username')}
                title="Копировать"
              >
                {copied.username ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="credential-item">
            <label>Пароль:</label>
            <div className="credential-value">
              <span className="credential-text">
                {showPassword ? password : '••••••••'}
              </span>
              <button 
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              <button 
                className="btn-copy"
                onClick={() => handleCopy(password, 'password')}
                title="Копировать"
              >
                {copied.password ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="credential-item">
            <label>Роль:</label>
            <div className="credential-value">
              <span className={`role-badge ${role}`}>
                {role === 'admin' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>
          </div>
        </div>

        <div className="credentials-info-message">
          ℹ️ Учётные данные сохранены. Вы можете посмотреть их в любое время в списке пользователей.
        </div>
        
        <div className="credentials-modal-buttons">
          <button className="credentials-btn-primary" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCredentialsModal;

