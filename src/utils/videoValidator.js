import screenRequirements from '../data/screenRequirements.json';

// Получаем общие настройки из нового формата
const commonSettings = screenRequirements.commonSettings;
const screens = screenRequirements.screens;

// Конвертируем максимальный размер из MB в байты
const maxFileSizeBytes = commonSettings.maxSize * 1024 * 1024;

export const validateVideo = (file) => {
  return new Promise((resolve, reject) => {
    // Проверка размера файла
    const fileSizeValid = file.size <= maxFileSizeBytes;
    
    // Создаём видео элемент для получения метаданных
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      const duration = Math.round(video.duration);
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Проверка длительности
      const durationValid = commonSettings.allowedDurations.includes(duration);
      
      // Проверка разрешения - ищем подходящий экран
      const matchingScreen = screens.find(
        screen => screen.width === width && screen.height === height
      );
      const resolutionValid = matchingScreen !== undefined;
      
      const validationResult = {
        isValid: fileSizeValid && durationValid && resolutionValid,
        fileSize: file.size,
        fileSizeValid,
        duration,
        durationValid,
        width,
        height,
        resolutionValid,
        fileName: file.name,
        fileType: file.type,
        matchingScreen: matchingScreen || null
      };
      
      resolve(validationResult);
    };
    
    video.onerror = () => {
      reject(new Error('Не удалось загрузить видео'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

export const getVideoMetadata = async (file) => {
  try {
    const validation = await validateVideo(file);
    
    // Получаем расширение файла
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Проверяем контейнер
    const containerValid = fileExtension === commonSettings.container;
    
    // Информация о подходящем экране
    const screenInfo = validation.matchingScreen 
      ? `${validation.matchingScreen.name}${validation.matchingScreen.nightVersion ? ' (требуется ночная версия)' : ''}`
      : 'Не найден подходящий экран';
    
    return {
      duration: `${validation.duration} секунд`,
      durationStatus: validation.durationValid ? 'success' : 'error',
      container: `.${fileExtension}`,
      containerStatus: containerValid ? 'success' : 'error',
      codec: commonSettings.codec.toUpperCase(),
      codecStatus: 'success',
      fps: commonSettings.fps.toString(),
      fpsStatus: 'success',
      resolution: `${validation.width}x${validation.height} px`,
      resolutionStatus: validation.resolutionValid ? 'success' : 'error',
      fileSize: validation.fileSize,
      fileSizeValid: validation.fileSizeValid,
      containerValid: containerValid,
      isValid: validation.isValid && containerValid,
      screenInfo: screenInfo,
      matchingScreen: validation.matchingScreen
    };
  } catch (error) {
    console.error('Ошибка при получении метаданных:', error);
    throw error;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
};

// Экспортируем функции для получения требований
export const getRequirements = () => ({
  maxFileSize: maxFileSizeBytes,
  maxFileSizeMB: commonSettings.maxSize,
  allowedDurations: commonSettings.allowedDurations,
  allowedFormats: [`video/${commonSettings.container}`],
  allowedContainers: [commonSettings.container],
  fps: commonSettings.fps,
  codec: commonSettings.codec
});

export const getScreens = () => screens;

export const getScreenByResolution = (width, height) => {
  return screens.find(screen => screen.width === width && screen.height === height);
};

