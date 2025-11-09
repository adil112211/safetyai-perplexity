const express = require('express');
const router = express.Router();

router.post('/ask', async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = `Ответ на ваш вопрос: "${question}". 
    
    Это демонстрационный ответ. В production версии будет интегрирован OpenAI для генерации умных ответов.
    
    Убедитесь что вы настроили все необходимые API ключи в Environment Variables.`;

    res.json({
      success: true,
      answer: answer,
      sources: []
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
