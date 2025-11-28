import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RippleGrid from '../components/RippleGrid';
import GooeyNav from '../components/GooeyNav';
import { ReactComponent as EuroLogo } from '../assets/logos/euro-logo.svg';
import './HistoryPage.css';

function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    // Загружаем историю из localStorage
    loadHistory();
    
    // Обновляем историю при возврате на страницу
    const handleFocus = () => {
      loadHistory();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [navigate]);

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('videoHistory');
      console.log('Загрузка истории, данные из localStorage:', savedHistory);
      
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        console.log('История загружена, элементов:', parsedHistory.length);
        setHistory(parsedHistory);
      } else {
        console.log('История пуста');
        setHistory([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
      setHistory([]);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleDeleteClick = (video, index) => {
    setVideoToDelete({ video, index });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (videoToDelete !== null) {
      const newHistory = history.filter((_, i) => i !== videoToDelete.index);
      localStorage.setItem('videoHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
      setShowDeleteModal(false);
      setVideoToDelete(null);
      
      // Проверяем, нужно ли вернуться на предыдущую страницу
      const newTotalPages = Math.ceil(newHistory.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const handleClearAllClick = () => {
    setShowClearAllModal(true);
  };

  const handleConfirmClearAll = () => {
    localStorage.setItem('videoHistory', JSON.stringify([]));
    setHistory([]);
    setShowClearAllModal(false);
    setCurrentPage(1);
  };

  const handleCancelClearAll = () => {
    setShowClearAllModal(false);
  };

  const handleNavClick = (item) => {
    if (item.action === 'home') {
      navigate('/home');
    } else if (item.action === 'history') {
      // Уже на странице истории
      return;
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

  // Вычисляем пагинацию
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = history.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDownloadReport = (video) => {
    // Формируем текстовый отчёт
    const report = `
ОТЧЁТ О ПРОВЕРКЕ ВИДЕО
======================

Название файла: ${video.fileName}
Дата проверки: ${new Date(video.timestamp).toLocaleString('ru-RU')}
Статус: ${video.passed ? 'ПРОВЕРКА ПРОЙДЕНА' : 'ПРОВЕРКА НЕ ПРОЙДЕНА'}

ПАРАМЕТРЫ ВИДЕО:
- Длительность: ${video.duration}
- Контейнер: ${video.container}
- Разрешение: ${video.resolution}
- Размер файла: ${video.fileSize}

${video.passed ? '✓ Все параметры соответствуют требованиям' : '✗ Обнаружены несоответствия требованиям'}
    `.trim();

    // Создаём и скачиваем файл
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${video.fileName}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="history-page">
      {/* Ripple Grid фон */}
      <div className="history-background">
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
          initialActiveIndex={1}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          onItemClick={handleNavClick}
        />
      </div>

      {/* Содержимое страницы истории */}
      <div className="history-content">
        <div className="history-header">
          <div className="history-header-left">
            <button className="btn-back" onClick={handleBack}>
              ← Назад
            </button>
            <h1 className="history-title">История проверок</h1>
          </div>
          {history.length > 0 && (
            <button className="btn-clear-all" onClick={handleClearAllClick}>
              Очистить всё
            </button>
          )}
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-history">
              <p>История проверок пуста</p>
            </div>
          ) : (
            currentItems.map((video, index) => {
              const actualIndex = startIndex + index;
              return (
              <div key={actualIndex} className="history-item">
                {video.thumbnail && (
                  <div className="history-item-thumbnail">
                    <img src={video.thumbnail} alt={video.fileName} />
                  </div>
                )}
                
                <div className="history-item-info">
                  <h3 className="history-item-name">{video.fileName}</h3>
                  <p className="history-item-date">
                    {new Date(video.timestamp).toLocaleString('ru-RU')}
                  </p>
                </div>
                
                <div className={`history-item-status ${video.passed ? 'success' : 'error'}`}>
                  {video.passed ? '✓ Пройдено' : '✗ Не пройдено'}
                </div>

                <button 
                  className="btn-download-report"
                  onClick={() => handleDownloadReport(video)}
                >
                  Скачать отчёт
                </button>

                <button 
                  className="btn-delete-report"
                  onClick={() => handleDeleteClick(video, actualIndex)}
                >
                  Удалить
                </button>
              </div>
            );
            })
          )}
        </div>

        {/* Пагинация */}
        {history.length > itemsPerPage && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ← Назад
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно удаления одного видео */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Подтверждение удаления</h2>
            <p className="modal-text">
              Вы уверены, что хотите удалить отчёт для видео<br />
              <strong>{videoToDelete?.video.fileName}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-cancel" onClick={handleCancelDelete}>
                Отмена
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleConfirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно очистки всей истории */}
      {showClearAllModal && (
        <div className="modal-overlay" onClick={handleCancelClearAll}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Подтверждение очистки</h2>
            <p className="modal-text">
              Вы уверены, что хотите удалить всю историю проверок?<br />
              <strong>Это действие нельзя отменить!</strong>
            </p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-cancel" onClick={handleCancelClearAll}>
                Отмена
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleConfirmClearAll}>
                Очистить всё
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

