const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Получить статистику пользователя
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.telegramId;

    // Количество пройденных тестов
    const { count: testsCompleted } = await supabase
      .from('test_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Средний балл
    const { data: results } = await supabase
      .from('test_results')
      .select('score')
      .eq('user_id', userId);

    const averageScore = results.length > 0
      ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
      : 0;

    // Количество сертификатов
    const { count: certificatesCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Количество отчетов о нарушениях
    const { count: violationsCount } = await supabase
      .from('violations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      stats: {
        testsCompleted: testsCompleted || 0,
        averageScore: averageScore,
        certificatesEarned: certificatesCount || 0,
        violationsReported: violationsCount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить лидерборд
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit || 50;

    // SQL запрос для получения рейтинга
    const { data: leaderboard, error } = await supabase
      .rpc('get_leaderboard', {
        limit_count: limit
      });

    if (error) {
      // Fallback если нет функции - берем данные напрямую
      const { data: results } = await supabase
        .from('test_results')
        .select('user_id, score, users(first_name, last_name)')
        .order('score', { ascending: false });

      const grouped = {};
      results.forEach(r => {
        if (!grouped[r.user_id]) {
          grouped[r.user_id] = {
            userId: r.user_id,
            name: `${r.users.first_name} ${r.users.last_name}`,
            totalScore: 0,
            testsCount: 0
          };
        }
        grouped[r.user_id].totalScore += r.score;
        grouped[r.user_id].testsCount++;
      });

      const sorted = Object.values(grouped)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit)
        .map((item, idx) => ({
          ...item,
          rank: idx + 1,
          averageScore: Math.round(item.totalScore / item.testsCount)
        }));

      return res.json({ leaderboard: sorted });
    }

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;