import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ColorBends from '../components/ColorBends';
import SplitText from '../components/SplitText';
import { ReactComponent as Logo } from '../assets/logos/euro-logo.svg';
import { preloadComponents } from '../utils/preloadPages';
import usersData from '../data/users.json';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Функция для сброса localStorage (полезна для отладки)
  const resetLocalStorage = () => {
    console.log('Сброс localStorage');
    localStorage.removeItem('users');
    localStorage.removeItem('user');
    localStorage.setItem('users', JSON.stringify(usersData));
    setError('');
    setSuccessMessage('LocalStorage сброшен. Попробуйте войти снова.');
    
    // Автоматически скрыть сообщение через 3 секунды
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Предзагрузка компонентов в фоне
  useEffect(() => {
    preloadComponents();
    
    // Инициализируем localStorage с пользователями из JSON, если их там нет
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers) {
      console.log('Инициализация пользователей в localStorage');
      localStorage.setItem('users', JSON.stringify(usersData));
    } else {
      console.log('Пользователи уже есть в localStorage:', JSON.parse(savedUsers));
    }

    // Проверяем, есть ли уже авторизованный пользователь
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      console.log('Найден авторизованный пользователь:', JSON.parse(currentUser));
      // Можно автоматически перенаправить на главную
      // navigate('/home');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Загружаем пользователей из localStorage (они могут быть обновлены админом)
    const savedUsers = localStorage.getItem('users');
    const users = savedUsers ? JSON.parse(savedUsers).users : usersData.users;

    console.log('Попытка входа:', { username, password });
    console.log('Доступные пользователи:', users);

    // Ищем пользователя (сравнение нечувствительно к регистру для username)
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    console.log('Найденный пользователь:', user);

    if (user) {
      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Пользователь успешно авторизован');
      // Переходим на главную страницу
      navigate('/home');
    } else {
      console.log('Пользователь не найден или неверный пароль');
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="login-page">
      {/* ColorBends фон */}
      <div className="login-background">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={180}
          speed={0.5}
          scale={1.1}
          frequency={1.5}
          warpStrength={1.18}
          mouseInfluence={0.8}
          parallax={0.6}
          noise={0}
          transparent={false}
        />
      </div>

      {/* Логотип */}
      <div className="logo-container">
        <Logo className="euro-logo" />
      </div>

      {/* Форма авторизации */}
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <SplitText
            text="Добро пожаловать на страницу авторизации"
            className="welcome-text"
            tag="h1"
            delay={50}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <div className="form-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Логин"
              required
              className="liquid-glass-input"
            />
          </div>

          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="liquid-glass-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '5px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          {successMessage && (
            <div style={{
              padding: '12px',
              marginBottom: '15px',
              backgroundColor: 'rgba(0, 255, 209, 0.1)',
              border: '1px solid rgba(0, 255, 209, 0.3)',
              borderRadius: '8px',
              color: '#00ffd1',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {successMessage}
            </div>
          )}

          <button type="submit" className="login-button">
            Войти
          </button>

          <div className="test-credentials">
            <p>Тестовые данные:</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => { setUsername('Admin'); setPassword('admin148'); }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Админ
              </button>
              <button 
                type="button" 
                onClick={() => { setUsername('Eurouser'); setPassword('user148'); }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Пользователь
              </button>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={resetLocalStorage}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 92, 122, 0.2)',
                  border: '1px solid rgba(255, 92, 122, 0.5)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Сбросить кэш
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

