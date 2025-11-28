const CACHE_NAME = 'video-checker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/bundle.js',
  '/manifest.json'
];

// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache install error:', err);
      })
  );
  self.skipWaiting();
});

// Активация Service Worker и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Стратегия кэширования: Network First, затем Cache
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Пропускаем запросы к chrome-extension и другим внешним ресурсам
  if (!request.url.startsWith('http')) {
    return;
  }

  // Для навигационных запросов (страницы)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Клонируем ответ для кэша
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, возвращаем из кэша
          return caches.match(request).then(response => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Для статических ресурсов (JS, CSS, изображения)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          // Возвращаем из кэша и обновляем в фоне
          fetch(request).then(response => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response);
            });
          }).catch(() => {});
          return cachedResponse;
        }
        
        // Если нет в кэше, загружаем из сети
        return fetch(request).then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Для остальных запросов - просто пытаемся загрузить из сети
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

