# Файлы данных

## screenRequirements.json

Файл содержит требования к видео для всех экранов ТРЦ «Европейский».

### Структура

```json
{
  "commonSettings": {
    "fps": 25,                      // Частота кадров
    "container": "mp4",             // Формат контейнера
    "codec": "h264",                // Видеокодек
    "maxSize": 100,                 // Максимальный размер в МБ
    "allowedDurations": [15, 30]    // Допустимая длительность в секундах
  },
  "screens": [
    {
      "id": 1,                      // Уникальный ID экрана
      "name": "Название экрана",    // Описание местоположения
      "width": 1920,                // Ширина в пикселях
      "height": 1080,               // Высота в пикселях
      "nightVersion": false         // Требуется ли ночная версия
    }
  ]
}
```

### Использование

```javascript
import screenRequirements from './screenRequirements.json';

// Получить общие настройки
const { fps, container, codec, maxSize, allowedDurations } = screenRequirements.commonSettings;

// Найти экран по разрешению
const screen = screenRequirements.screens.find(
  s => s.width === 1920 && s.height === 1080
);

// Проверить, нужна ли ночная версия
if (screen && screen.nightVersion) {
  console.log('Требуется ночная версия');
}
```

## Другие файлы данных

- **users.json** - данные пользователей системы
- **adminQueue.json** - очередь видео на проверку администратором
- **notifications.json** - уведомления пользователей
- **videoHistory.json** - история проверенных видео

