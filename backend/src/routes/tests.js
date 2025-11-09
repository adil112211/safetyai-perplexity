const express = require('express');
const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    const tests = [
      {
        id: '1',
        title: 'Пожарная безопасность',
        description: 'Основные принципы пожарной безопасности',
        difficulty: 'Начальный',
        duration: 45,
        questions_count: 10
      },
      {
        id: '2',
        title: 'Работа на высоте',
        description: 'Безопасность при работе на высоте',
        difficulty: 'Средний',
        duration: 60,
        questions_count: 15
      }
    ];
    res.json({ tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { testId, topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const questions = [
      {
        question: `Вопрос 1: Что такое ${topic}?`,
        options: ['Ответ A', 'Ответ B', 'Ответ C', 'Ответ D'],
        correctAnswer: 0
      },
      {
        question: `Вопрос 2: Какой протокол нужно использовать при ${topic}?`,
        options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
        correctAnswer: 1
      }
    ];

    res.json({
      success: true,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { testId, answers } = req.body;

    const score = 87;
    const passed = score >= 85;

    res.json({
      success: true,
      score: score,
      passed: passed,
      resultId: 'test-result-id'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
