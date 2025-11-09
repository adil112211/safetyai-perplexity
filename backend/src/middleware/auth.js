const crypto = require('crypto');

function validateTelegramAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const initDataRaw = authHeader.replace('Bearer ', '');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Распарсиваем данные
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    
    // Удаляем hash из параметров
    params.delete('hash');

    // Создаем проверочную строку
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем подпись
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверяем подпись
    if (computedHash !== hash) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Извлекаем данные пользователя
    const userString = params.get('user');
    if (!userString) {
      return res.status(401).json({ error: 'No user data' });
    }

    const user = JSON.parse(userString);
    
    // Добавляем пользователя в request
    req.user = {
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || null
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { validateTelegramAuth };