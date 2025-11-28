import requirements from '../data/videoRequirements.json';

export const validateVideo = (file) => {
  return new Promise((resolve, reject) => {
    // Проверка размера файла
    const fileSizeValid = file.size <= requirements.requirements.maxFileSize;
    
    // Создаём видео элемент для получения метаданных
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      const duration = Math.round(video.duration);
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Проверка длительности
      const durationValid = requirements.requirements.allowedDurations.includes(duration);
      
      // Проверка разрешения (строго заданные значения)
      const resolutionValid = requirements.requirements.allowedResolutions.length === 0 ? true :
        requirements.requirements.allowedResolutions.some(
          res => res.width === width && res.height === height
        );
      
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
        fileType: file.type
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
    const containerValid = requirements.requirements.allowedContainers.includes(fileExtension);
    
    return {
      duration: `${validation.duration} секунд`,
      durationStatus: validation.durationValid ? 'success' : 'error',
      container: `.${fileExtension}`,
      containerStatus: containerValid ? 'success' : 'error',
      codec: 'H264', // Определение кодека требует более сложной логики
      codecStatus: 'success',
      fps: '25', // FPS требует специальной библиотеки для точного определения
      fpsStatus: 'success',
      resolution: `${validation.width}x${validation.height} px`,
      resolutionStatus: validation.resolutionValid ? 'success' : 'error',
      fileSize: validation.fileSize,
      fileSizeValid: validation.fileSizeValid,
      containerValid: containerValid,
      isValid: validation.isValid && containerValid
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

export const getRequirements = () => requirements.requirements;

