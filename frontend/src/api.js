import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getInitData = () => {
  // Если браузер поддерживает Telegram WebApp
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  // Для локального тестирования
  return 'test_init_data';
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

apiClient.interceptors.request.use((config) => {
  const initData = getInitData();
  if (initData) {
    config.headers.Authorization = `Bearer ${initData}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
