import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Ленивая загрузка страниц для оптимизации
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Компонент загрузки
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '18px'
  }}>
    Загрузка...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
