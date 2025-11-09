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
      return res.json({ 
        success: false, 
        error: 'No auth header' 
      });
    }

    const initDataRaw = authHeader.replace('Bearer ', '');

    try {
      const params = new URLSearchParams(initDataRaw);
      const userString = params.get('user');
      
      if (!userString) {
        return res.json({ 
          success: false, 
          error: 'No user data' 
        });
      }

      const user = JSON.parse(userString);

      // ✅ ИЩЕМ ПОЛЬЗОВАТЕЛЯ В БД
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.id)
        .single();

      // ✅ ЕСЛИ НЕ НАЙДЕН - СОЗДАЕМ
      if (!existingUser) {
        console.log('👤 Creating new user:', user.id);
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              telegram_id: user.id,
              first_name: user.first_name || 'User',
              last_name: user.last_name || '',
              username: user.username || ''
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        existingUser = newUser;
        console.log('✅ User created:', existingUser.id);
      } else {
        console.log('✅ User found:', existingUser.id);
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
      res.json({ 
        success: false, 
        error: err.message 
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
