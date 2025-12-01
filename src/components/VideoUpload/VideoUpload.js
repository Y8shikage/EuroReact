import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as DropFileIcon } from '../../assets/icons/DropFileIcon.svg';
import { getRequirements } from '../../utils/videoValidator';
import Folder from '../Folder';
import screenRequirements from '../../data/screenRequirements.json';
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

  const handleDownloadGuide = () => {
    const { commonSettings, screens } = screenRequirements;
    
    // Создаём текст справки
    const guide = `
╔════════════════════════════════════════════════════════════╗
║           СПРАВКА ПО ТРЕБОВАНИЯМ К ВИДЕО                 ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ОБЩИЕ ТРЕБОВАНИЯ К ВИДЕОФАЙЛАМ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 КОНТЕЙНЕР:           .${commonSettings.container.toUpperCase()}
📌 КОДЕК:               ${commonSettings.codec.toUpperCase()}
📌 ЧАСТОТА КАДРОВ:      ${commonSettings.fps} FPS
📌 МАКСИМАЛЬНЫЙ РАЗМЕР: ${commonSettings.maxSize} МБ
📌 ДЛИТЕЛЬНОСТЬ:        ${commonSettings.allowedDurations.join(' или ')} секунд

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ДОСТУПНЫЕ ЭКРАНЫ И ИХ РАЗРЕШЕНИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${screens.map((screen, index) => {
  const nightInfo = screen.nightVersion ? ' (есть ночная версия)' : '';
  return `${(index + 1).toString().padStart(2, '0')}. ${screen.name}${nightInfo}
    └─ Разрешение: ${screen.width}x${screen.height} px`;
}).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ВАЖНАЯ ИНФОРМАЦИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ ВНИМАНИЕ:
• Все параметры видео должны СТРОГО соответствовать указанным
  требованиям
• Разрешение видео должно точно совпадать с разрешением одного
  из доступных экранов
• Файлы, не соответствующие требованиям, будут отклонены
  администратором

📋 РЕКОМЕНДАЦИИ:
• Используйте профессиональные видеоредакторы для экспорта
  (Adobe Premiere, DaVinci Resolve, Final Cut Pro и др.)
• Проверяйте параметры видео перед загрузкой
• Называйте файлы понятными именами для упрощения
  идентификации
• Убедитесь, что видео соответствует длительности 15 или 30
  секунд

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  НАСТРОЙКИ ЭКСПОРТА (ПРИМЕР ДЛЯ ADOBE PREMIERE PRO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Формат: H.264
2. Предустановка: Высокое качество 1080p HD (или выше)
3. Настройки видео:
   - Частота кадров: ${commonSettings.fps}
   - Разрешение: выберите из списка экранов выше
   - Профиль: High
   - Уровень: 4.2 или выше
4. Настройки битрейта:
   - Режим кодирования: VBR, 2 прохода
   - Целевой битрейт: 10-20 Мбит/с
   - Максимальный битрейт: 25 Мбит/с

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Дата создания справки: ${new Date().toLocaleString('ru-RU')}
Версия: 1.0

Powered by EuroMedia Validation System
    `.trim();

    // Создаём blob и скачиваем
    const blob = new Blob([guide], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Справка_требования_к_видео.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          
          <button 
            className="btn-guide"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadGuide();
            }}
            title="Скачать справку с требованиями к видео"
          >
            Справка
          </button>
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

