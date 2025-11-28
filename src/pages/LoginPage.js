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
  const navigate = useNavigate();

  // Предзагрузка компонентов в фоне
  useEffect(() => {
    preloadComponents();
    
    // Инициализируем localStorage с пользователями из JSON, если их там нет
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers) {
      localStorage.setItem('users', JSON.stringify(usersData));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Загружаем пользователей из localStorage (они могут быть обновлены админом)
    const savedUsers = localStorage.getItem('users');
    const users = savedUsers ? JSON.parse(savedUsers).users : usersData.users;

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(user));
      // Переходим на главную страницу
      navigate('/home');
    } else {
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
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              className="liquid-glass-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Войти
          </button>

          <div className="test-credentials">
            <p>Тестовые данные:</p>
            <p>Admin, admin148</p>
            <p>Eurouser, user148</p>
          </div>
        </form>
      </div>
    </div>
  );
}

