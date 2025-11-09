import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://safetyai-perplexity.vercel.app';

console.log('🔗 API URL:', API_URL);

export const getInitData = () => {
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  return 'test_init_data';
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
});

apiClient.interceptors.request.use((config) => {
  const initData = getInitData();
  if (initData) {
    config.headers.Authorization = `Bearer ${initData}`;
  }
  console.log('📤 Request:', config.method.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const getCourses = async () => {
  try {
    console.log('→ Fetching courses from:', API_URL);
    const response = await apiClient.get('/api/courses/list');
    console.log('✅ Courses received:', response.data);
    return response.data.courses || [];
  } catch (error) {
    console.error('❌ getCourses error:', error);
    return [];
  }
};

export const getTests = async () => {
  try {
    console.log('→ Fetching tests from:', API_URL);
    const response = await apiClient.get('/api/tests/list');
    console.log('✅ Tests received:', response.data);
    return response.data.tests || [];
  } catch (error) {
    console.error('❌ getTests error:', error);
    return [];
  }
};

export const getLeaderboard = async () => {
  try {
    console.log('→ Fetching leaderboard from:', API_URL);
    const response = await apiClient.get('/api/dashboard/leaderboard');
    console.log('✅ Leaderboard received:', response.data);
    return response.data.leaderboard || [];
  } catch (error) {
    console.error('❌ getLeaderboard error:', error);
    return [];
  }
};

export const getStats = async () => {
  try {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data.stats || {};
  } catch (error) {
    console.error('❌ getStats error:', error);
    return {};
  }
};

export default apiClient;
