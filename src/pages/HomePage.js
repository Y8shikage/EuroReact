import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RippleGrid from '../components/RippleGrid';
import VideoUpload from '../components/VideoUpload';
import VideoInfo from '../components/VideoInfo';
import GooeyNav from '../components/GooeyNav';
import Modal from '../components/Modal';
import { getVideoMetadata } from '../utils/videoValidator';
import { ReactComponent as EuroLogo } from '../assets/logos/euro-logo.svg';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  const generateVideoThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        // Переходим к 1 секунде видео для лучшего кадра
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        try {
          // Устанавливаем размер canvas (маленькое превью)
          canvas.width = 160;
          canvas.height = 90;
          
          // Рисуем кадр видео на canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Конвертируем в base64
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          
          // Очищаем
          URL.revokeObjectURL(video.src);
          resolve(thumbnail);
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => {
        reject(new Error('Не удалось загрузить видео для создания превью'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      // Получаем метаданные видео и проверяем
      const metadata = await getVideoMetadata(file);
      
      // Создаём превью
      const thumbnail = await generateVideoThumbnail(file);
      
      // Добавляем статус размера файла
      const fileSizeStatus = metadata.fileSizeValid ? 'success' : 'error';
      
      const videoData = {
        ...metadata,
        fileSizeStatus,
        thumbnail: thumbnail // Сохраняем превью в videoData
      };
      
      setVideoData(videoData);
      
      // Сохраняем в историю с превью
      saveToHistory(file.name, videoData, thumbnail);
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Ошибка при обработке видео:', error);
      setIsProcessing(false);
      setModalState({
        isOpen: true,
        title: 'Ошибка обработки',
        message: 'Не удалось обработать видео. Попробуйте другой файл.',
        type: 'error'
      });
    }
  };

  const saveToHistory = (fileName, videoData, thumbnail) => {
    try {
      const historyItem = {
        fileName,
        timestamp: Date.now(),
        passed: videoData.isValid,
        duration: videoData.duration,
        container: videoData.container,
        resolution: videoData.resolution,
        fileSize: `${Math.round(videoData.fileSize / 1024 / 1024)} МБ`,
        thumbnail: thumbnail // Сохраняем base64 превью
      };

      console.log('Сохранение в историю:', historyItem);

      // Получаем текущую историю
      const savedHistory = localStorage.getItem('videoHistory');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Добавляем новый элемент в начало
      history.unshift(historyItem);
      
      // Ограничиваем историю 50 элементами
      if (history.length > 50) {
        history.pop();
      }
      
      // Сохраняем обратно
      localStorage.setItem('videoHistory', JSON.stringify(history));
      console.log('История сохранена, всего элементов:', history.length);
    } catch (error) {
      console.error('Ошибка сохранения в историю:', error);
    }
  };

  const handleSubmitVideo = () => {
    if (!videoData || !videoData.isValid) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'unknown';

    const queueItem = {
      fileName: selectedFile.name,
      timestamp: Date.now(),
      username: username,
      duration: videoData.duration,
      container: videoData.container,
      resolution: videoData.resolution,
      fileSize: `${Math.round(videoData.fileSize / 1024 / 1024)} МБ`,
      thumbnail: videoData.thumbnail,
      status: 'pending' // pending, approved, rejected
    };

    // Добавляем в очередь админа
    const queueKey = 'adminQueue';
    const savedQueue = localStorage.getItem(queueKey);
    const queue = savedQueue ? JSON.parse(savedQueue) : [];
    queue.unshift(queueItem);
    localStorage.setItem(queueKey, JSON.stringify(queue));

    // Показываем уведомление
    setModalState({
      isOpen: true,
      title: 'Успешно отправлено!',
      message: 'Видео успешно отправлено на проверку администратору.',
      type: 'success'
    });
    
    // Очищаем форму
    handleCancel();
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setVideoData(null);
    setIsProcessing(false);
  };

  const handleNavClick = (item) => {
    if (item.action === 'home') {
      // Уже на главной странице
      return;
    } else if (item.action === 'history') {
      navigate('/history');
    } else if (item.action === 'notifications') {
      navigate('/notifications');
    } else if (item.action === 'admin') {
      navigate('/admin');
    } else if (item.action === 'logout') {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  // Проверяем роль пользователя для отображения кнопки админ-панели
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const navItems = isAdmin ? [
    { label: 'Главная', href: '#', action: 'home' },
    { label: 'История', href: '#', action: 'history' },
    { label: 'Уведомления', href: '#', action: 'notifications' },
    { label: 'Админ', href: '#', action: 'admin' },
    { label: 'Выход', href: '#', action: 'logout' }
  ] : [
    { label: 'Главная', href: '#', action: 'home' },
    { label: 'История', href: '#', action: 'history' },
    { label: 'Уведомления', href: '#', action: 'notifications' },
    { label: 'Выход', href: '#', action: 'logout' }
  ];

  return (
    <div className="home-page">
      {/* Ripple Grid фон */}
      <div className="home-background">
        <RippleGrid
          enableRainbow={false}
          gridColor="#8a5cff"
          rippleIntensity={0.01}
          gridSize={20}
          gridThickness={20}
          fadeDistance={2.5}
          vignetteStrength={1.5}
          glowIntensity={0.2}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={0.9}
        />
      </div>

      {/* Логотип и навигация */}
      <div className="page-header">
        <div className="page-logo">
          <EuroLogo />
        </div>
        <GooeyNav
          items={navItems}
          particleCount={15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={0}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          onItemClick={handleNavClick}
        />
      </div>

      {/* Содержимое главной страницы */}
      <div className="home-content">
        <div className="content-grid">
          <VideoUpload 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onCancel={handleCancel}
            onSubmit={handleSubmitVideo}
            isValid={videoData?.isValid || false}
          />
          
          <VideoInfo 
            videoData={videoData}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Модальное окно для уведомлений */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
}

export default HomePage;

