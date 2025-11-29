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

  // Функция для генерации и скачивания отчёта
  const handleDownloadReport = () => {
    if (!videoData) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const timestamp = new Date().toLocaleString('ru-RU');
    
    // Форматируем размер файла
    const fileSizeMB = (videoData.fileSize / 1024 / 1024).toFixed(2);
    
    // Создаём текст отчёта
    const report = `
╔════════════════════════════════════════════════════════════╗
║           ОТЧЁТ О ПРОВЕРКЕ ВИДЕОФАЙЛА                    ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ОБЩАЯ ИНФОРМАЦИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Дата проверки:       ${timestamp}
Проверил:            ${user.username || 'Неизвестно'}
Статус проверки:     ${hasErrors ? '❌ НЕ ПРОЙДЕНА' : '✅ УСПЕШНО ПРОЙДЕНА'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ПАРАМЕТРЫ ВИДЕО
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Длина видео:         ${videoData.duration}
                     [${videoData.durationStatus === 'success' ? '✓' : '✗'} ${videoData.durationStatus === 'success' ? 'Соответствует' : 'Не соответствует'}]

Контейнер:           ${videoData.container}
                     [${videoData.containerStatus === 'success' ? '✓' : '✗'} ${videoData.containerStatus === 'success' ? 'Соответствует' : 'Не соответствует'}]

Кодек:               ${videoData.codec}
                     [${videoData.codecStatus === 'success' ? '✓' : '✗'} ${videoData.codecStatus === 'success' ? 'Соответствует' : 'Не соответствует'}]

Частота кадров:      ${videoData.fps} FPS
                     [${videoData.fpsStatus === 'success' ? '✓' : '✗'} ${videoData.fpsStatus === 'success' ? 'Соответствует' : 'Не соответствует'}]

Разрешение:          ${videoData.resolution}
                     [${videoData.resolutionStatus === 'success' ? '✓' : '✗'} ${videoData.resolutionStatus === 'success' ? 'Соответствует' : 'Не соответствует'}]

Размер файла:        ${fileSizeMB} МБ
                     [${videoData.fileSizeValid ? '✓' : '✗'} ${videoData.fileSizeValid ? 'В пределах нормы' : 'Превышает допустимый размер'}]

${videoData.screenInfo ? `Подходящий экран:    ${videoData.screenInfo}
                     [${videoData.matchingScreen ? '✓' : '✗'} ${videoData.matchingScreen ? 'Найден' : 'Не найден'}]` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${videoData.serverValidation ? `✓ Серверная валидация выполнена успешно` : `⚠ Серверная валидация не выполнена (offline режим)`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ИТОГОВОЕ ЗАКЛЮЧЕНИЕ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${hasErrors ? 
`❌ ВИДЕОФАЙЛ НЕ СООТВЕТСТВУЕТ ТРЕБОВАНИЯМ

Файл не может быть использован в текущем виде.
Необходимо исправить указанные выше параметры.` : 
`✅ ВИДЕОФАЙЛ СООТВЕТСТВУЕТ ВСЕМ ТРЕБОВАНИЯМ

Файл готов к использованию и может быть отправлен
на дальнейшую обработку.`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Сгенерировано системой проверки видеофайлов
Powered by EuroMedia Validation System
    `.trim();

    // Создаём blob и скачиваем
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Отчёт_проверки_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          
          {videoData.screenInfo && (
            <div className={`info-item ${videoData.matchingScreen ? 'success' : 'error'}`}>
              <span className="info-label">Подходящий экран:</span>
              <span className="info-value">{videoData.screenInfo}</span>
            </div>
          )}
          
          <div className={`status-badge ${hasErrors ? 'error' : 'success'}`}>
            <span className="status-icon">{hasErrors ? '✗' : '✓'}</span>
            {hasErrors ? 'Проверка не пройдена' : 'Проверка успешно пройдена'}
          </div>
          
          <button 
            className="btn-download"
            onClick={handleDownloadReport}
            title="Скачать подробный отчёт о проверке"
          >
            Скачать отчёт
          </button>
        </div>
      )}
    </div>
  );
}

