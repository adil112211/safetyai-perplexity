const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ ОЧЕНЬ ВАЖНО - добавь CORS!
app.use(cors({
  origin: [
    'https://safetyai-perplexity-front-git-main-adil112211s-projects.vercel.app',
    'https://safetyai-perplexity-front.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/violations', require('./routes/violations'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
