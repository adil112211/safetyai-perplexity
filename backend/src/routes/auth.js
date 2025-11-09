const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization' });
    }

    const initDataRaw = authHeader.replace('Bearer ', '');

    // Если это тестовые данные
    if (initDataRaw === 'test_init_data') {
      const testUser = {
        id: 'demo-1',
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo_user'
      };
      return res.json({ success: true, user: testUser });
    }

    try {
      const params = new URLSearchParams(initDataRaw);
      const userString = params.get('user');
      
      if (!userString) {
        return res.status(401).json({ error: 'No user data' });
      }

      const user = JSON.parse(userString);

      // Проверяем есть ли пользователь в БД
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.id)
        .single();

      // Если пользователя нет - создаем
      if (!existingUser) {
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
    } catch (err) {
      console.error('Parse/DB error:', err);
      // Даже если ошибка - даем доступ демо-пользователю
      res.json({
        success: true,
        user: {
          id: 'demo-1',
          firstName: 'Demo',
          lastName: 'User',
          username: 'demo'
        }
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
