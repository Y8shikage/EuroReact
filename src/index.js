import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import GlobalStyles from './styles/GlobalStyles';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyles />
    <App />
  </React.StrictMode>
);

// Регистрация Service Worker для кэширования
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker зарегистрирован:', registration.scope);
        
        // Проверка обновлений каждые 60 секунд
        setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch(error => {
        console.log('Ошибка регистрации Service Worker:', error);
      });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
