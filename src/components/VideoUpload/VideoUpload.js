import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as DropFileIcon } from '../../assets/icons/DropFileIcon.svg';
import { getRequirements } from '../../utils/videoValidator';
import Folder from '../Folder';
import './VideoUpload.css';

export default function VideoUpload({ onFileSelect, selectedFile, onCancel, onSubmit, isValid }) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [folderKey, setFolderKey] = useState(0);
  const fileInputRef = useRef(null);
  const requirements = getRequirements();

  const handleFolderClick = () => {
    navigate('/history');
  };

  // Обновляем ключ Folder при изменении selectedFile
  React.useEffect(() => {
    if (selectedFile) {
      setFolderKey(prev => prev + 1);
    }
  }, [selectedFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file) => {
    setError('');
    
    // Проверка типа файла
    if (!file.type.startsWith('video/')) {
      setError('Пожалуйста, выберите видео файл');
      return false;
    }
    
    // Проверка размера файла
    if (file.size > requirements.maxFileSize) {
      setError(`Размер файла превышает ${requirements.maxFileSizeMB} МБ`);
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  };

  return (
    <div className="video-upload-container">
      <h2 className="upload-title">Загрузить</h2>
      
      {!selectedFile ? (
        <>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <DropFileIcon className="drop-icon" />
            <p className="drop-text">Перетяните ваш файл или загрузите с устройства</p>
            <p className="drop-limit">
              Максимальный размер файла {requirements.maxFileSizeMB} МБ
              <br />
              Длительность: {requirements.allowedDurations.join(' или ')} секунд
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      ) : (
        <div className="file-selected">
          <div className="file-info">
            <div className="file-icon-wrapper">
              <DropFileIcon className="file-icon" />
            </div>
            <div className="file-details">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="btn-cancel" onClick={onCancel}>
              Назад
            </button>
            <button 
              className={`btn-save ${!isValid ? 'disabled' : ''}`}
              onClick={onSubmit}
              disabled={!isValid}
            >
              Отправить
            </button>
          </div>

          <div className="folder-container">
            <Folder 
              key={folderKey}
              size={1.5} 
              color="#8a5cff" 
              onClick={handleFolderClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}

