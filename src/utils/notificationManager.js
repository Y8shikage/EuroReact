// Утилита для управления уведомлениями

/**
 * Создаёт уведомление для пользователя
 * @param {string} username - Имя пользователя
 * @param {string} type - Тип уведомления: 'approved', 'rejected', 'info'
 * @param {string} fileName - Название файла видео
 * @param {string} message - Дополнительное сообщение (опционально)
 */
export const createNotification = (username, type, fileName, message = '') => {
  const notification = {
    id: Date.now(),
    username: username,
    type: type,
    fileName: fileName,
    message: message,
    timestamp: Date.now(),
    read: false
  };

  // Получаем существующие уведомления
  const savedNotifications = localStorage.getItem('notifications');
  const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

  // Добавляем новое уведомление
  notifications.unshift(notification);

  // Ограничиваем количество уведомлений (максимум 100)
  if (notifications.length > 100) {
    notifications.pop();
  }

  // Сохраняем
  localStorage.setItem('notifications', JSON.stringify(notifications));

  console.log('Уведомление создано:', notification);
  return notification;
};

/**
 * Получает уведомления для конкретного пользователя
 * @param {string} username - Имя пользователя
 * @returns {Array} Массив уведомлений
 */
export const getUserNotifications = (username) => {
  const savedNotifications = localStorage.getItem('notifications');
  const allNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];

  // Фильтруем по пользователю
  return allNotifications.filter(n => n.username === username);
};

/**
 * Получает количество непрочитанных уведомлений
 * @param {string} username - Имя пользователя
 * @returns {number} Количество непрочитанных
 */
export const getUnreadCount = (username) => {
  const userNotifications = getUserNotifications(username);
  return userNotifications.filter(n => !n.read).length;
};

/**
 * Отмечает уведомление как прочитанное
 * @param {number} notificationId - ID уведомления
 */
export const markAsRead = (notificationId) => {
  const savedNotifications = localStorage.getItem('notifications');
  const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

  const updatedNotifications = notifications.map(n => {
    if (n.id === notificationId) {
      return { ...n, read: true };
    }
    return n;
  });

  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
};

/**
 * Отмечает все уведомления пользователя как прочитанные
 * @param {string} username - Имя пользователя
 */
export const markAllAsRead = (username) => {
  const savedNotifications = localStorage.getItem('notifications');
  const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

  const updatedNotifications = notifications.map(n => {
    if (n.username === username) {
      return { ...n, read: true };
    }
    return n;
  });

  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
};

/**
 * Удаляет уведомление
 * @param {number} notificationId - ID уведомления
 */
export const deleteNotification = (notificationId) => {
  const savedNotifications = localStorage.getItem('notifications');
  const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

  const updatedNotifications = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
};

/**
 * Очищает все уведомления пользователя
 * @param {string} username - Имя пользователя
 */
export const clearUserNotifications = (username) => {
  const savedNotifications = localStorage.getItem('notifications');
  const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

  const updatedNotifications = notifications.filter(n => n.username !== username);
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
};

/**
 * Создаёт уведомление об одобрении видео администратором
 * @param {string} username - Имя пользователя
 * @param {string} fileName - Название файла
 */
export const notifyVideoApproved = (username, fileName) => {
  return createNotification(
    username,
    'approved',
    fileName,
    'Ваше видео успешно прошло проверку администратора!'
  );
};

/**
 * Создаёт уведомление об отклонении видео администратором
 * @param {string} username - Имя пользователя
 * @param {string} fileName - Название файла
 * @param {string} reason - Причина отклонения
 */
export const notifyVideoRejected = (username, fileName, reason = '') => {
  const message = reason 
    ? `Ваше видео не прошло проверку. Причина: ${reason}`
    : 'Ваше видео не прошло проверку администратора.';
  
  return createNotification(
    username,
    'rejected',
    fileName,
    message
  );
};

/**
 * Создаёт информационное уведомление
 * @param {string} username - Имя пользователя
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 */
export const notifyInfo = (username, title, message) => {
  return createNotification(
    username,
    'info',
    title,
    message
  );
};

