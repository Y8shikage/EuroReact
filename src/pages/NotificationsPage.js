import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RippleGrid from '../components/RippleGrid';
import GooeyNav from '../components/GooeyNav';
import { ReactComponent as EuroLogo } from '../assets/logos/euro-logo.svg';
import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllReadNotifications } from '../utils/notificationManager';
import './NotificationsPage.css';

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    // Загружаем уведомления
    loadNotifications();
  }, [navigate]);

  const loadNotifications = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'unknown';
    const userNotifications = getUserNotifications(username);
    setNotifications(userNotifications);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'unknown';
    markAllAsRead(username);
    loadNotifications();
  };

  const handleDeleteAllRead = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'unknown';
    const deletedCount = deleteAllReadNotifications(username);
    
    if (deletedCount > 0) {
      loadNotifications();
      
      // Проверяем, не осталась ли текущая страница пустой
      const remainingNotifications = getUserNotifications(username);
      const newTotalPages = Math.ceil(remainingNotifications.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (remainingNotifications.length === 0) {
        setCurrentPage(1);
      }
    }
  };

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete.id);
      loadNotifications();
      setShowDeleteModal(false);
      setNotificationToDelete(null);
      
      // Проверяем, не осталась ли текущая страница пустой
      const newTotalPages = Math.ceil((notifications.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleNavClick = (item) => {
    if (item.action === 'home') {
      navigate('/home');
    } else if (item.action === 'history') {
      navigate('/history');
    } else if (item.action === 'notifications') {
      // Уже на странице уведомлений
      return;
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
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Прокручиваем к началу списка уведомлений
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="notifications-page">
      {/* Ripple Grid фон */}
      <div className="notifications-background">
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
          initialActiveIndex={2}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          onItemClick={handleNavClick}
        />
      </div>

      {/* Содержимое страницы уведомлений */}
      <div className="notifications-content">
        <div className="notifications-header">
          <div className="notifications-header-left">
            <button className="btn-back" onClick={handleBack}>
              ← Назад
            </button>
            <h1 className="notifications-title">Уведомления</h1>
          </div>
          {notifications.length > 0 && (
            <div className="notifications-header-actions">
              <button className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
                Прочитать всё
              </button>
              {notifications.some(n => n.read) && (
                <button className="btn-delete-all-read" onClick={handleDeleteAllRead}>
                  Удалить прочитанные
                </button>
              )}
            </div>
          )}
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-icon">🔔</div>
              <p>У вас пока нет уведомлений</p>
            </div>
          ) : (
            currentNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
              >
                <div className="notification-icon">
                  {notification.type === 'approved' && '✓'}
                  {notification.type === 'rejected' && '✗'}
                  {notification.type === 'info' && 'ℹ'}
                </div>
                
                <div className="notification-content">
                  <h3>{notification.fileName}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleString('ru-RU')}
                  </span>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button 
                      className="btn-mark-read"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Отметить как прочитанное"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="btn-delete-notification"
                    onClick={() => handleDeleteClick(notification)}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Назад
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Удалить уведомление?</h2>
            <p className="modal-text">
              Вы уверены, что хотите удалить это уведомление?
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
    </div>
  );
}

export default NotificationsPage;

