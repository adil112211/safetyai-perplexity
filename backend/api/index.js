const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импортируем маршруты
const authRoutes = require('../src/routes/auth');
const testsRoutes = require('../src/routes/tests');
const certificatesRoutes = require('../src/routes/certificates');
const violationsRoutes = require('../src/routes/violations');
const dashboardRoutes = require('../src/routes/dashboard');
const coursesRoutes = require('../src/routes/courses');
const aiRoutes = require('../src/routes/ai');

// Импортируем middleware
const { validateTelegramAuth } = require('../src/middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Маршруты БЕЗ проверки авторизации (только auth)
app.use('/api/auth', authRoutes);

// Все остальные маршруты требуют авторизацию
app.use(validateTelegramAuth);

app.use('/api/tests', testsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;