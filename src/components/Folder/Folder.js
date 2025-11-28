import { useState, useEffect } from 'react';
import './Folder.css';

const darkenColor = (hex, percent) => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder = ({ color = '#5227FF', size = 1, className = '', onClick }) => {
  const maxItems = 3;
  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  const [videoThumbnails, setVideoThumbnails] = useState([]);

  useEffect(() => {
    // Функция для загрузки последних 3 видео из истории
    const loadThumbnails = () => {
      try {
        const savedHistory = localStorage.getItem('videoHistory');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          const lastThree = history.slice(0, 3);
          setVideoThumbnails(lastThree);
          console.log('Folder: загружено превью:', lastThree.length);
        } else {
          setVideoThumbnails([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки превью в Folder:', error);
        setVideoThumbnails([]);
      }
    };

    loadThumbnails();

    // Обновляем при изменении localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'videoHistory') {
        loadThumbnails();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handleClick = () => {
    setOpen(prev => !prev);
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperClick = (e, index) => {
    e.stopPropagation();
    if (onClick) {
      onClick(index);
    }
  };

  const handlePaperMouseMove = (e, index) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;

    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e, index) => {
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3
  };

  const folderClassName = `folder ${open ? 'open' : ''}`.trim();
  const scaleStyle = { transform: `scale(${size})` };

  const renderPaperContent = (index) => {
    const video = videoThumbnails[index];
    if (!video) return null;

    return (
      <div className="paper-content">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.fileName} className="paper-full-thumbnail" />
        ) : (
          <div className="paper-no-thumbnail">Нет превью</div>
        )}
      </div>
    );
  };

  return (
    <div style={scaleStyle} className={className}>
      <div className={folderClassName} style={folderStyle} onClick={handleClick}>
        <div className="folder__back">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`paper paper-${i + 1}`}
              onClick={(e) => handlePaperClick(e, i)}
              onMouseMove={e => handlePaperMouseMove(e, i)}
              onMouseLeave={e => handlePaperMouseLeave(e, i)}
              style={
                open
                  ? {
                      '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                      '--magnet-y': `${paperOffsets[i]?.y || 0}px`
                    }
                  : {}
              }
            >
              {renderPaperContent(i)}
            </div>
          ))}
          <div className="folder__front"></div>
          <div className="folder__front right"></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;

