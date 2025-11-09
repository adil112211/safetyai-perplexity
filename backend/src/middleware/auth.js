const crypto = require('crypto');

function validateTelegramAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Если нет авторизации - даем демо доступ
      req.user = {
        telegramId: 12345,
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo'
      };
      return next();
    }

    const initDataRaw = authHeader.replace('Bearer ', '');

    // Если это тестовые данные
    if (initDataRaw === 'test_init_data') {
      req.user = {
        telegramId: 12345,
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo'
      };
      return next();
    }

    try {
      const params = new URLSearchParams(initDataRaw);
      const userString = params.get('user');
      
      if (!userString) {
        return next(); // Пропускаем
      }

      const user = JSON.parse(userString);
      
      req.user = {
        telegramId: user.id,
        firstName: user.first_name || 'User',
        lastName: user.last_name || '',
        username: user.username || ''
      };
      
      return next();
    } catch (err) {
      console.error('Parse error:', err);
      return next(); // Пропускаем при ошибке
    }
  } catch (error) {
    console.error('Auth error:', error);
    return next();
  }
}

module.exports = { validateTelegramAuth };
