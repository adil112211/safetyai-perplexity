const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Создать отчет о нарушении
router.post('/create', async (req, res) => {
  try {
    const { description, category, photoBase64 } = req.body;
    const userId = req.user.telegramId;

    let photoUrl = null;

    // Загружаем фото если есть
    if (photoBase64) {
      const buffer = Buffer.from(photoBase64, 'base64');
      const fileName = `violation-${Date.now()}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('violations')
        .upload(`${userId}/${fileName}`, buffer, {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase
        .storage
        .from('violations')
        .getPublicUrl(`${userId}/${fileName}`);

      photoUrl = publicUrl.publicUrl;
    }

    // Сохраняем отчет в БД
    const { data: violation, error } = await supabase
      .from('violations')
      .insert([
        {
          user_id: userId,
          photo_url: photoUrl,
          description: description,
          category: category,
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      violation: {
        id: violation.id,
        photoUrl: violation.photo_url,
        description: violation.description,
        category: violation.category,
        reportedAt: violation.reported_at
      }
    });
  } catch (error) {
    console.error('Create violation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить список нарушений пользователя
router.get('/list', async (req, res) => {
  try {
    const userId = req.user.telegramId;

    const { data: violations, error } = await supabase
      .from('violations')
      .select('*')
      .eq('user_id', userId)
      .order('reported_at', { ascending: false });

    if (error) throw error;

    res.json({ violations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;