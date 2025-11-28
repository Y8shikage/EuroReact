import React from 'react';
import './VideoInfo.css';

export default function VideoInfo({ videoData, isProcessing }) {
  // Проверяем наличие ошибок
  const hasErrors = videoData && (
    videoData.durationStatus === 'error' ||
    videoData.containerStatus === 'error' ||
    videoData.codecStatus === 'error' ||
    videoData.fpsStatus === 'error' ||
    videoData.resolutionStatus === 'error' ||
    videoData.fileSizeStatus === 'error'
  );

  return (
    <div className="video-info-container">
      <h2 className="info-title">Данные загруженного файла</h2>
      
      {!videoData && !isProcessing ? (
        <div className="empty-state">
          <p className="empty-text">Empty</p>
        </div>
      ) : isProcessing ? (
        <div className="processing-state">
          <div className="spinner"></div>
          <p>Обработка видео...</p>
        </div>
      ) : (
        <div className="info-list">
          <div className={`info-item ${videoData.durationStatus || 'success'}`}>
            <span className="info-label">Длина видео:</span>
            <span className="info-value">{videoData.duration || '15 секунд'}</span>
          </div>
          
          <div className={`info-item ${videoData.containerStatus || 'success'}`}>
            <span className="info-label">Контейнер:</span>
            <span className="info-value">{videoData.container || '.mp4'}</span>
          </div>
          
          <div className={`info-item ${videoData.codecStatus || 'success'}`}>
            <span className="info-label">Кодек:</span>
            <span className="info-value">{videoData.codec || 'H264'}</span>
          </div>
          
          <div className={`info-item ${videoData.fpsStatus || 'success'}`}>
            <span className="info-label">Частота кадров:</span>
            <span className="info-value">{videoData.fps || '25'}</span>
          </div>
          
          <div className={`info-item ${videoData.resolutionStatus || 'success'}`}>
            <span className="info-label">Разрешение:</span>
            <span className="info-value">{videoData.resolution || '2560x1440 px'}</span>
          </div>
          
          <div className={`status-badge ${hasErrors ? 'error' : 'success'}`}>
            <span className="status-icon">{hasErrors ? '✗' : '✓'}</span>
            {hasErrors ? 'Проверка не пройдена' : 'Проверка успешно пройдена'}
          </div>
          
          <button className="btn-download">
            Скачать отчёт
          </button>
        </div>
      )}
    </div>
  );
}

