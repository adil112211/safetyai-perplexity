const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

router.get('/list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.json({ courses: [] });
    }

    res.json({ courses: data || [] });
  } catch (error) {
    console.error('Error:', error);
    res.json({ courses: [] });
  }
});

module.exports = router;
