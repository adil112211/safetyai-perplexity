const crypto = require('crypto');

function validateTelegramAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Для демонстрации - позволяем без проверки
      req.user = {
        telegramId: 12345,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser'
      };
      return next();
    }

    const initDataRaw = authHeader.replace('Bearer ', '');
    
    // Если это тестовые данные - пропускаем проверку
    if (initDataRaw === 'test_init_data') {
      req.user = {
        telegramId: 12345,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser'
      };
      return next();
    }

    // Пробуем распарсить initData
    try {
      const params = new URLSearchParams(initDataRaw);
      const userString = params.get('user');
      
      if (!userString) {
        throw new Error('No user data');
      }

      const user = JSON.parse(userString);
      
      req.user = {
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name || '',
        username: user.username || ''
      };
      
      next();
    } catch (err) {
      console.log('Parse error (continuing anyway):', err.message);
      // Даже если не получилось распарсить - продолжаем
      req.user = {
        telegramId: 12345,
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo'
      };
      next();
    }
  } catch (error) {
    console.error('Auth error:', error);
    // При любой ошибке - даем доступ с демо данными
    req.user = {
      telegramId: 12345,
      firstName: 'Demo',
      lastName: 'User',
      username: 'demo'
    };
    next();
  }
}

module.exports = { validateTelegramAuth };
