const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Получить список всех курсов
router.get('/list', async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить детали курса с уроками
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_num', { ascending: true });

    if (lessonsError) throw lessonsError;

    res.json({
      course: {
        ...course,
        lessons: lessons
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить прогресс пользователя по курсу
router.get('/:courseId/progress', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.telegramId;

    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      progress: progress || {
        progressPercent: 0,
        completed: false
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить прогресс курса
router.post('/:courseId/progress', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progressPercent, completed } = req.body;
    const userId = req.user.telegramId;

    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .upsert([
        {
          user_id: userId,
          course_id: courseId,
          progress_percent: progressPercent,
          completed: completed
        }
      ], { onConflict: 'user_id,course_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;