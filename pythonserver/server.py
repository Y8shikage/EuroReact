"""
Сервер валидации видеофайлов для цифровых экранов
FastAPI сервер для проверки технических характеристик видео (codec, fps)
"""

import json
import logging
import os
import tempfile
import traceback
from pathlib import Path
from typing import Optional, Dict, Any, List

import ffmpeg
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Инициализация FastAPI приложения
app = FastAPI(
    title="Video Validator API",
    description="API для валидации видеофайлов для цифровых экранов",
    version="1.0.0"
)

# Настройка CORS для разрешения cross-origin запросов
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить все origins для разработки
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, etc.)
    allow_headers=["*"],  # Разрешить все заголовки
)

# Константы
MAX_FILE_SIZE = 400 * 1024 * 1024  # 400 МБ в байтах (соответствует фронтенду)
FPS_TOLERANCE = 0.1  # Допустимая погрешность для FPS
REQUIREMENTS_FILE = "screenRequirements.json"

# Глобальная переменная для хранения требований
requirements_cache: Optional[Dict[str, Any]] = None


def load_requirements() -> Dict[str, Any]:
    """
    Загрузить требования из файла screenRequirements.json
    
    Returns:
        Dict с требованиями к видео
        
    Raises:
        HTTPException: Если файл не найден или содержит невалидный JSON
    """
    global requirements_cache
    
    # Используем кэш, если файл уже загружен
    if requirements_cache is not None:
        return requirements_cache
    
    try:
        requirements_path = Path(__file__).parent / REQUIREMENTS_FILE
        
        if not requirements_path.exists():
            logger.error(f"Файл {REQUIREMENTS_FILE} не найден по пути: {requirements_path}")
            raise HTTPException(
                status_code=500,
                detail=f"Файл конфигурации {REQUIREMENTS_FILE} не найден"
            )
        
        # Читаем файл с кодировкой UTF-8 (для поддержки русских названий)
        with open(requirements_path, 'r', encoding='utf-8') as f:
            requirements_cache = json.load(f)
        
        logger.info(f"Требования успешно загружены из {REQUIREMENTS_FILE}")
        return requirements_cache
        
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка парсинга JSON в {REQUIREMENTS_FILE}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Невалидный JSON в файле {REQUIREMENTS_FILE}"
        )
    except Exception as e:
        logger.error(f"Неожиданная ошибка при загрузке требований: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка загрузки файла конфигурации: {str(e)}"
        )


def normalize_codec(codec_name: str) -> str:
    """
    Нормализовать название кодека к стандартному виду
    
    ffprobe может возвращать разные варианты для h264:
    "h264", "libx264", "avc1" - все это варианты h264
    
    Args:
        codec_name: Название кодека из ffprobe
        
    Returns:
        Нормализованное название кодека (в нижнем регистре)
    """
    codec_lower = codec_name.lower().strip()
    
    # Все варианты h264
    h264_variants = ['h264', 'libx264', 'avc1', 'x264']
    
    if codec_lower in h264_variants:
        return 'h264'
    
    return codec_lower


def parse_fps(fps_string: str) -> float:
    """
    Парсить FPS из строки формата "25/1" или "30000/1001"
    
    Args:
        fps_string: Строка с FPS в формате "числитель/знаменатель"
        
    Returns:
        FPS как float, округлённый до 2 знаков после запятой
    """
    try:
        if '/' in fps_string:
            numerator, denominator = fps_string.split('/')
            fps = float(numerator) / float(denominator)
        else:
            fps = float(fps_string)
        
        # Округляем до 2 знаков после запятой
        return round(fps, 2)
    except Exception as e:
        logger.error(f"Ошибка парсинга FPS '{fps_string}': {e}")
        return 0.0


def get_video_info(file_path: str) -> Dict[str, Any]:
    """
    Извлечь информацию о видео с помощью ffprobe
    
    Args:
        file_path: Путь к видеофайлу
        
    Returns:
        Dict с информацией о видео (codec, fps)
        
    Raises:
        Exception: Если не удалось извлечь информацию
    """
    try:
        # Используем ffprobe для получения информации о видео
        probe = ffmpeg.probe(file_path)
        
        # Ищем видео поток
        video_stream = None
        for stream in probe.get('streams', []):
            if stream.get('codec_type') == 'video':
                video_stream = stream
                break
        
        if video_stream is None:
            raise ValueError("Файл не содержит видео поток")
        
        # Извлекаем codec
        codec_name = video_stream.get('codec_name', '')
        if not codec_name:
            raise ValueError("Не удалось определить кодек видео")
        
        # Извлекаем FPS
        # Сначала пробуем r_frame_rate (более точное значение)
        fps_string = video_stream.get('r_frame_rate', video_stream.get('avg_frame_rate', '0/1'))
        fps = parse_fps(fps_string)
        
        if fps == 0.0:
            raise ValueError("Не удалось определить FPS видео")
        
        logger.info(f"Извлечена информация о видео: codec={codec_name}, fps={fps}")
        
        return {
            'codec': normalize_codec(codec_name),
            'fps': fps,
            'raw_codec': codec_name,
            'raw_fps': fps_string
        }
        
    except ffmpeg.Error as e:
        error_message = e.stderr.decode('utf-8') if e.stderr else str(e)
        logger.error(f"FFprobe ошибка: {error_message}")
        raise Exception(f"Не удалось прочитать видеофайл: {error_message}")
    except Exception as e:
        logger.error(f"Ошибка при извлечении информации о видео: {e}")
        raise


def validate_video(video_info: Dict[str, Any], requirements: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Валидировать видео согласно требованиям
    
    Args:
        video_info: Информация о видео (codec, fps)
        requirements: Требования из screenRequirements.json
        
    Returns:
        Tuple (valid: bool, errors: List[str])
    """
    errors = []
    common_settings = requirements.get('commonSettings', {})
    
    # Получаем требуемые значения
    required_codec = common_settings.get('codec', 'h264')
    required_fps = common_settings.get('fps', 25)
    
    # Проверяем codec
    actual_codec = video_info.get('codec', '')
    if actual_codec != required_codec:
        errors.append(f"Неверный кодек: {video_info.get('raw_codec', actual_codec)}, требуется {required_codec}")
        logger.warning(f"Codec mismatch: {actual_codec} != {required_codec}")
    
    # Проверяем FPS с учётом допустимой погрешности
    actual_fps = video_info.get('fps', 0.0)
    fps_diff = abs(actual_fps - required_fps)
    
    if fps_diff > FPS_TOLERANCE:
        errors.append(f"Неверный FPS: {actual_fps}, требуется {required_fps}")
        logger.warning(f"FPS mismatch: {actual_fps} != {required_fps} (difference: {fps_diff})")
    
    is_valid = len(errors) == 0
    
    return is_valid, errors


@app.get("/health")
async def health_check():
    """
    Endpoint для проверки здоровья сервера
    
    Returns:
        JSON с статусом сервера
    """
    return {
        "status": "ok",
        "message": "Video validator server is running"
    }


@app.get("/api/requirements")
async def get_requirements():
    """
    Endpoint для получения текущих требований из JSON файла
    Полезен для отладки
    
    Returns:
        JSON с требованиями к видео
    """
    try:
        requirements = load_requirements()
        logger.info("Запрошены требования к видео")
        return requirements
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Ошибка при получении требований: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validate-video")
async def validate_video_endpoint(
    file: UploadFile = File(...),
    screen_id: Optional[int] = Query(None, description="ID экрана для проверки разрешения")
):
    """
    Endpoint для валидации видеофайла
    
    Принимает видеофайл через multipart/form-data и проверяет:
    - Codec (должен быть h264)
    - FPS (должен быть 25 ±0.1)
    
    Args:
        file: Видеофайл (multipart/form-data)
        screen_id: Опциональный ID экрана (не используется на бэкенде)
        
    Returns:
        JSON с результатами валидации
    """
    temp_file_path = None
    
    try:
        # Логируем входящий запрос
        logger.info(f"Получен запрос на валидацию видео: filename={file.filename}, content_type={file.content_type}")
        
        # Валидация MIME-типа
        if file.content_type and not file.content_type.startswith('video/'):
            logger.warning(f"Неверный MIME-тип: {file.content_type}")
            return JSONResponse(
                status_code=400,
                content={
                    "valid": False,
                    "codec": None,
                    "fps": None,
                    "errors": [f"Неверный тип файла: {file.content_type}. Ожидается видеофайл."]
                }
            )
        
        # Проверка имени файла на path traversal атаки
        if file.filename and ('..' in file.filename or '/' in file.filename or '\\' in file.filename):
            logger.warning(f"Подозрительное имя файла: {file.filename}")
            return JSONResponse(
                status_code=400,
                content={
                    "valid": False,
                    "codec": None,
                    "fps": None,
                    "errors": ["Недопустимое имя файла"]
                }
            )
        
        # Загружаем требования
        requirements = load_requirements()
        
        # Создаём временный файл для безопасного хранения загруженного видео
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            temp_file_path = temp_file.name
            
            # Читаем файл частями, чтобы не загружать всё в память
            file_size = 0
            chunk_size = 1024 * 1024  # 1 МБ
            
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                
                file_size += len(chunk)
                
                # Проверяем размер файла
                if file_size > MAX_FILE_SIZE:
                    logger.warning(f"Файл слишком большой: {file_size} bytes")
                    return JSONResponse(
                        status_code=413,
                        content={
                            "valid": False,
                            "codec": None,
                            "fps": None,
                            "errors": [f"Файл слишком большой. Максимальный размер: {MAX_FILE_SIZE // (1024*1024)} МБ"]
                        }
                    )
                
                temp_file.write(chunk)
        
        logger.info(f"Файл сохранён во временное хранилище: {temp_file_path}, размер: {file_size} bytes")
        
        # Извлекаем информацию о видео с помощью ffprobe
        try:
            video_info = get_video_info(temp_file_path)
        except Exception as e:
            logger.error(f"Ошибка при анализе видео: {e}\n{traceback.format_exc()}")
            return JSONResponse(
                status_code=400,
                content={
                    "valid": False,
                    "codec": None,
                    "fps": None,
                    "errors": [f"Не удалось проанализировать видеофайл: {str(e)}"]
                }
            )
        
        # Валидируем видео
        is_valid, errors = validate_video(video_info, requirements)
        
        # Формируем ответ
        response = {
            "valid": is_valid,
            "codec": video_info.get('raw_codec', video_info.get('codec')),
            "fps": video_info.get('fps'),
            "errors": errors
        }
        
        # Логируем результат
        if is_valid:
            logger.info(f"✅ Видео прошло валидацию: {file.filename}")
        else:
            logger.warning(f"❌ Видео не прошло валидацию: {file.filename}, ошибки: {errors}")
        
        return response
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обработке запроса: {e}\n{traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={
                "valid": False,
                "codec": None,
                "fps": None,
                "errors": [f"Внутренняя ошибка сервера: {str(e)}"]
            }
        )
    finally:
        # Всегда удаляем временный файл
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"Временный файл удалён: {temp_file_path}")
            except Exception as e:
                logger.error(f"Не удалось удалить временный файл {temp_file_path}: {e}")


# Точка входа для запуска сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

