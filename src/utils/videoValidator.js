import screenRequirements from '../data/screenRequirements.json';
import backendConfig from '../config/backend.json';

// Получаем общие настройки из нового формата
const commonSettings = screenRequirements.commonSettings;
const screens = screenRequirements.screens;

// Конвертируем максимальный размер из MB в байты
const maxFileSizeBytes = commonSettings.maxSize * 1024 * 1024;

// Функция для валидации видео на сервере
const validateVideoOnServer = async (file) => {
  if (!backendConfig.ENABLE_BACKEND_VALIDATION) {
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${backendConfig.BACKEND_URL}${backendConfig.ENDPOINTS.VALIDATE_VIDEO}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (!response.ok) {
      console.error('Ошибка валидации на сервере:', response.status);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Ошибка при обращении к серверу:', error);
    return null;
  }
};

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
    
    // Попытка получить данные с сервера
    const serverValidation = await validateVideoOnServer(file);
    
    // Если сервер вернул данные, используем их для кодека и FPS
    let codec = commonSettings.codec.toUpperCase();
    let codecStatus = 'success';
    let fps = commonSettings.fps.toString();
    let fpsStatus = 'success';
    let isValidFinal = validation.isValid && containerValid;
    
    if (serverValidation) {
      // Получаем данные с сервера
      codec = serverValidation.video_info?.codec || codec;
      fps = serverValidation.video_info?.fps?.toString() || fps;
      
      // Проверяем валидность на основе ответа сервера
      if (serverValidation.is_valid !== undefined) {
        const codecMatch = serverValidation.video_info?.codec?.toLowerCase() === commonSettings.codec.toLowerCase();
        const fpsMatch = Math.abs(parseFloat(serverValidation.video_info?.fps || 0) - commonSettings.fps) < 0.1;
        
        codecStatus = codecMatch ? 'success' : 'error';
        fpsStatus = fpsMatch ? 'success' : 'error';
        isValidFinal = validation.isValid && containerValid && codecMatch && fpsMatch;
      }
    }
    
    return {
      duration: `${validation.duration} секунд`,
      durationStatus: validation.durationValid ? 'success' : 'error',
      container: `.${fileExtension}`,
      containerStatus: containerValid ? 'success' : 'error',
      codec: codec,
      codecStatus: codecStatus,
      fps: fps,
      fpsStatus: fpsStatus,
      resolution: `${validation.width}x${validation.height} px`,
      resolutionStatus: validation.resolutionValid ? 'success' : 'error',
      fileSize: validation.fileSize,
      fileSizeValid: validation.fileSizeValid,
      containerValid: containerValid,
      isValid: isValidFinal,
      screenInfo: screenInfo,
      matchingScreen: validation.matchingScreen,
      serverValidation: serverValidation // Для отладки
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

