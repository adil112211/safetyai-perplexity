const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.get('/list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, difficulty, duration_minutes, lessons_count, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Courses error:', error.message);
      return res.status(500).json({ 
        courses: [],
        error: error.message 
      });
    }

    console.log('✅ Courses loaded:', data?.length || 0);
    res.json({ courses: data || [] });
  } catch (error) {
    console.error('❌ Courses exception:', error);
    res.status(500).json({ courses: [], error: error.message });
  }
});

module.exports = router;
