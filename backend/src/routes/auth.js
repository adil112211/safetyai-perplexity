const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Валидация и создание/обновление пользователя
router.post('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization' });
    }

    const initDataRaw = authHeader.replace('Bearer ', '');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Валидация подписи
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const userString = params.get('user');
    const user = JSON.parse(userString);

    // Ищем или создаем пользователя в Supabase
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingUser) {
      // Создаем нового пользователя
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || '',
            username: user.username || ''
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      existingUser = newUser;
    }

    res.json({
      success: true,
      user: {
        id: existingUser.id,
        telegramId: existingUser.telegram_id,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
        username: existingUser.username
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;