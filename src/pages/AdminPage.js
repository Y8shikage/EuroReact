import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RippleGrid from '../components/RippleGrid';
import GooeyNav from '../components/GooeyNav';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import RejectModal from '../components/RejectModal';
import UserCredentialsModal from '../components/UserCredentialsModal';
import { ReactComponent as EuroLogo } from '../assets/logos/euro-logo.svg';
import { notifyVideoApproved, notifyVideoRejected, notifyInfo } from '../utils/notificationManager';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users'); // users, queue, notifications
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [credentialsModal, setCredentialsModal] = useState({
    isOpen: false,
    username: '',
    password: '',
    role: ''
  });

  // Форма создания пользователя
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    role: 'user'
  });

  // Форма рассылки уведомлений
  const [notification, setNotification] = useState({
    recipient: 'all', // all или конкретный username
    title: '',
    message: ''
  });

  // Состояние для показа/скрытия паролей
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Состояние для поиска пользователей
  const [searchQuery, setSearchQuery] = useState('');

  // Состояние для модального окна подтверждения удаления
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    username: '',
    userFullName: ''
  });

  // Состояние для модального окна отклонения видео
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    video: null,
    index: -1
  });

  useEffect(() => {
    // Проверяем авторизацию и права админа
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      navigate('/home');
      return;
    }

    loadUsers();
    loadQueue();
  }, [navigate]);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const usersData = JSON.parse(savedUsers);
      setUsers(usersData.users || []);
    }
  };

  const loadQueue = () => {
    const savedQueue = localStorage.getItem('adminQueue');
    const queueData = savedQueue ? JSON.parse(savedQueue) : [];
    setQueue(queueData);
  };

  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName) {
      setModalState({
        isOpen: true,
        title: 'Ошибка',
        message: 'Заполните имя и фамилию',
        type: 'error'
      });
      return;
    }

    const username = generateRandomString(8);
    const password = generateRandomString(8);

    const userToAdd = {
      username,
      password,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      middleName: newUser.middleName,
      createdAt: Date.now()
    };

    const updatedUsers = [...users, userToAdd];
    setUsers(updatedUsers);

    // Сохраняем в localStorage
    localStorage.setItem('users', JSON.stringify({ users: updatedUsers }));

    // Показываем модальное окно с учётными данными
    setCredentialsModal({
      isOpen: true,
      username: username,
      password: password,
      role: newUser.role
    });

    // Очищаем форму
    setNewUser({
      firstName: '',
      lastName: '',
      middleName: '',
      role: 'user'
    });
  };

  const handleDeleteUserClick = (user) => {
    if (user.username === 'Admin') {
      setModalState({
        isOpen: true,
        title: 'Ошибка',
        message: 'Нельзя удалить главного администратора',
        type: 'error'
      });
      return;
    }

    // Открываем модальное окно подтверждения
    setDeleteConfirm({
      isOpen: true,
      username: user.username,
      userFullName: `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim()
    });
  };

  const handleConfirmDelete = () => {
    const username = deleteConfirm.username;
    const updatedUsers = users.filter(u => u.username !== username);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify({ users: updatedUsers }));

    setModalState({
      isOpen: true,
      title: 'Успешно',
      message: 'Пользователь удалён',
      type: 'success'
    });
  };

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      (user.middleName && user.middleName.toLowerCase().includes(query))
    );
  });

  const handleApproveVideo = (video, index) => {
    // Отправляем уведомление пользователю
    notifyVideoApproved(video.username, video.fileName);

    // Удаляем из очереди
    const updatedQueue = queue.filter((_, i) => i !== index);
    setQueue(updatedQueue);
    localStorage.setItem('adminQueue', JSON.stringify(updatedQueue));

    setModalState({
      isOpen: true,
      title: 'Одобрено',
      message: `Видео "${video.fileName}" одобрено. Пользователь получит уведомление.`,
      type: 'success'
    });
  };

  const handleRejectVideoClick = (video, index) => {
    setRejectModal({
      isOpen: true,
      video: video,
      index: index
    });
  };

  const handleConfirmReject = (reason) => {
    const { video, index } = rejectModal;
    
    // Отправляем уведомление пользователю
    notifyVideoRejected(video.username, video.fileName, reason || '');

    // Удаляем из очереди
    const updatedQueue = queue.filter((_, i) => i !== index);
    setQueue(updatedQueue);
    localStorage.setItem('adminQueue', JSON.stringify(updatedQueue));

    // Закрываем модальное окно отклонения
    setRejectModal({
      isOpen: false,
      video: null,
      index: -1
    });

    // Показываем уведомление об успехе
    setModalState({
      isOpen: true,
      title: 'Отклонено',
      message: `Видео "${video.fileName}" отклонено. Пользователь получит уведомление.`,
      type: 'info'
    });
  };

  const handleSendNotification = () => {
    if (!notification.title || !notification.message) {
      setModalState({
        isOpen: true,
        title: 'Ошибка',
        message: 'Заполните заголовок и сообщение',
        type: 'error'
      });
      return;
    }

    if (notification.recipient === 'all') {
      // Отправляем всем пользователям
      users.forEach(user => {
        notifyInfo(user.username, notification.title, notification.message);
      });

      setModalState({
        isOpen: true,
        title: 'Отправлено',
        message: `Уведомление отправлено всем пользователям (${users.length})`,
        type: 'success'
      });
    } else {
      // Отправляем конкретному пользователю
      notifyInfo(notification.recipient, notification.title, notification.message);

      setModalState({
        isOpen: true,
        title: 'Отправлено',
        message: `Уведомление отправлено пользователю ${notification.recipient}`,
        type: 'success'
      });
    }

    // Очищаем форму
    setNotification({
      recipient: 'all',
      title: '',
      message: ''
    });
  };

  const handleNavClick = (item) => {
    if (item.action === 'home') {
      navigate('/home');
    } else if (item.action === 'history') {
      navigate('/history');
    } else if (item.action === 'notifications') {
      navigate('/notifications');
    } else if (item.action === 'admin') {
      // Уже на админ-панели
      return;
    } else if (item.action === 'logout') {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const navItems = [
    { label: 'Главная', href: '#', action: 'home' },
    { label: 'История', href: '#', action: 'history' },
    { label: 'Уведомления', href: '#', action: 'notifications' },
    { label: 'Админ', href: '#', action: 'admin' },
    { label: 'Выход', href: '#', action: 'logout' }
  ];

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  return (
    <div className="admin-page">
      {/* Ripple Grid фон */}
      <div className="admin-background">
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
          initialActiveIndex={3}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          onItemClick={handleNavClick}
        />
      </div>

      {/* Содержимое админ-панели */}
      <div className="admin-content">
        <h1 className="admin-title">Панель администратора</h1>

        {/* Вкладки */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
          <button
            className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Очередь ({queue.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Рассылка
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="tab-content">
          {/* Вкладка: Пользователи */}
          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="create-user-form">
                <h2>Создать нового пользователя</h2>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Фамилия"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Имя"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Отчество (необязательно)"
                    value={newUser.middleName}
                    onChange={(e) => setNewUser({ ...newUser, middleName: e.target.value })}
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                <button className="btn-create-user" onClick={handleCreateUser}>
                  Создать пользователя
                </button>
              </div>

              <div className="users-list">
                <div className="users-list-header">
                  <h2>Список пользователей ({filteredUsers.length} / {users.length})</h2>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Поиск по логину, имени или фамилии..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button
                        className="search-clear"
                        onClick={() => setSearchQuery('')}
                        title="Очистить поиск"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="no-users-found">
                    <p>Пользователи не найдены</p>
                  </div>
                ) : (
                  filteredUsers.map((user, index) => (
                  <div key={index} className="user-item">
                    <div className="user-info">
                      <h3>{user.lastName} {user.firstName} {user.middleName}</h3>
                      <p>Логин: <strong>{user.username}</strong></p>
                      <p className="password-field">
                        Пароль: 
                        <strong className="password-value">
                          {visiblePasswords[user.username] ? user.password : '••••••••'}
                        </strong>
                        <button
                          className="btn-toggle-password-inline"
                          onClick={() => setVisiblePasswords({
                            ...visiblePasswords,
                            [user.username]: !visiblePasswords[user.username]
                          })}
                          title={visiblePasswords[user.username] ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          {visiblePasswords[user.username] ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </p>
                      <p>Роль: <span className={`role-badge ${user.role}`}>{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</span></p>
                    </div>
                    <button
                      className="btn-delete-user"
                      onClick={() => handleDeleteUserClick(user)}
                      disabled={user.username === 'Admin'}
                    >
                      Удалить
                    </button>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Вкладка: Очередь */}
          {activeTab === 'queue' && (
            <div className="queue-tab">
              <h2>Очередь на одобрение ({queue.length})</h2>
              {queue.length === 0 ? (
                <div className="empty-queue">
                  <p>Очередь пуста</p>
                </div>
              ) : (
                queue.map((video, index) => (
                  <div key={index} className="queue-item">
                    {video.thumbnail && (
                      <div className="queue-thumbnail">
                        <img src={video.thumbnail} alt={video.fileName} />
                      </div>
                    )}
                    <div className="queue-info">
                      <h3>{video.fileName}</h3>
                      <p>Пользователь: <strong>{video.username}</strong></p>
                      <p>Дата: {new Date(video.timestamp).toLocaleString('ru-RU')}</p>
                      <p>Параметры: {video.resolution} • {video.duration} • {video.fileSize}</p>
                    </div>
                    <div className="queue-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApproveVideo(video, index)}
                      >
                        ✓ Одобрить
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectVideoClick(video, index)}
                      >
                        ✗ Отклонить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Вкладка: Рассылка */}
          {activeTab === 'notifications' && (
            <div className="notifications-tab">
              <h2>Рассылка уведомлений</h2>
              <div className="notification-form">
                <select
                  value={notification.recipient}
                  onChange={(e) => setNotification({ ...notification, recipient: e.target.value })}
                >
                  <option value="all">Всем пользователям</option>
                  {users.map((user, index) => (
                    <option key={index} value={user.username}>
                      {user.firstName} {user.lastName} ({user.username})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Заголовок уведомления"
                  value={notification.title}
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                />
                <textarea
                  placeholder="Текст уведомления"
                  value={notification.message}
                  onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                  rows={5}
                />
                <button className="btn-send-notification" onClick={handleSendNotification}>
                  Отправить уведомление
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      {/* Модальное окно с учётными данными */}
      <UserCredentialsModal
        isOpen={credentialsModal.isOpen}
        onClose={() => setCredentialsModal({ ...credentialsModal, isOpen: false })}
        username={credentialsModal.username}
        password={credentialsModal.password}
        role={credentialsModal.role}
      />

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить пользователя "${deleteConfirm.userFullName}" (${deleteConfirm.username})? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
      />

      {/* Модальное окно отклонения видео */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, video: null, index: -1 })}
        onConfirm={handleConfirmReject}
        videoName={rejectModal.video?.fileName || ''}
      />
    </div>
  );
}

export default AdminPage;

