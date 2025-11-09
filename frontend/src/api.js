import axios from 'axios';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getInitData = () => {
  try {
    const { initDataRaw } = retrieveLaunchParams();
    return initDataRaw;
  } catch (error) {
    console.error('Failed to get init data:', error);
    return null;
  }
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
  }
);

// Auth API
export const validateUser = async () => {
  const response = await apiClient.post('/api/auth/validate');
  return response.data.user;
};

// Courses API
export const getCourses = async () => {
  const response = await apiClient.get('/api/courses/list');
  return response.data.courses;
};

export const getCourseDetails = async (courseId) => {
  const response = await apiClient.get(`/api/courses/${courseId}`);
  return response.data.course;
};

export const getCourseProgress = async (courseId) => {
  const response = await apiClient.get(`/api/courses/${courseId}/progress`);
  return response.data.progress;
};

export const updateCourseProgress = async (courseId, progressPercent, completed) => {
  const response = await apiClient.post(`/api/courses/${courseId}/progress`, {
    progressPercent,
    completed
  });
  return response.data.progress;
};

// Tests API
export const getTests = async () => {
  const response = await apiClient.get('/api/tests/list');
  return response.data.tests;
};

export const generateTestQuestions = async (testId, topic) => {
  const response = await apiClient.post('/api/tests/generate', {
    testId,
    topic
  });
  return response.data.questions;
};

export const submitTest = async (testId, answers) => {
  const response = await apiClient.post('/api/tests/submit', {
    testId,
    answers
  });
  return response.data;
};

// Certificates API
export const generateCertificate = async (resultId) => {
  const response = await apiClient.post('/api/certificates/generate', {
    resultId
  });
  return response.data.certificate;
};

export const getCertificates = async () => {
  const response = await apiClient.get('/api/certificates/list');
  return response.data.certificates;
};

// Violations API
export const createViolation = async (description, category, photoBase64 = null) => {
  const response = await apiClient.post('/api/violations/create', {
    description,
    category,
    photoBase64
  });
  return response.data.violation;
};

export const getViolations = async () => {
  const response = await apiClient.get('/api/violations/list');
  return response.data.violations;
};

// Dashboard API
export const getStats = async () => {
  const response = await apiClient.get('/api/dashboard/stats');
  return response.data.stats;
};

export const getLeaderboard = async (limit = 50) => {
  const response = await apiClient.get(`/api/dashboard/leaderboard?limit=${limit}`);
  return response.data.leaderboard;
};

// AI API
export const askAI = async (question, conversationHistory = []) => {
  const response = await apiClient.post('/api/ai/ask', {
    question,
    conversationHistory
  });
  return response.data;
};

export default apiClient;