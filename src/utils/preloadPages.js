// Утилита для предзагрузки страниц в фоновом режиме

export const preloadPage = (pagePath) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = pagePath;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

export const preloadAllPages = () => {
  const pages = [
    '/home',
    '/history',
    '/notifications',
    '/admin'
  ];

  pages.forEach(page => {
    preloadPage(page).catch(err => {
      console.log(`Не удалось предзагрузить ${page}:`, err);
    });
  });
};

// Предзагрузка компонентов React
export const preloadComponents = () => {
  // Динамический импорт для предзагрузки
  const components = [
    () => import('../pages/HomePage'),
    () => import('../pages/HistoryPage'),
    () => import('../pages/NotificationsPage'),
    () => import('../pages/AdminPage'),
    () => import('../components/VideoUpload'),
    () => import('../components/VideoInfo'),
    () => import('../components/RippleGrid'),
    () => import('../components/GooeyNav')
  ];

  // Запускаем предзагрузку в фоне с задержкой
  setTimeout(() => {
    components.forEach(loadComponent => {
      loadComponent().catch(err => {
        console.log('Ошибка предзагрузки компонента:', err);
      });
    });
  }, 2000); // Задержка 2 секунды после загрузки страницы
};

