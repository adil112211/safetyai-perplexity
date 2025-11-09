const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

// Получить список тестов
router.get('/list', async (req, res) => {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Генерировать тест с вопросами через AI
router.post('/generate', async (req, res) => {
  try {
    const { testId, topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // 1. Ищем в Pinecone релевантные документы
    const index = pc.Index(process.env.PINECONE_INDEX_NAME);
    
    // Создаем embedding запроса
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: topic
    });

    // Ищем в Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 5,
      includeMetadata: true
    });

    // 2. Собираем контекст из результатов
    const context = searchResults.matches
      .map(match => match.metadata.text)
      .join('\n\n');

    // 3. Генерируем вопросы через OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты учитель по технике безопасности. Генерируй сложные вопросы для теста с 4 вариантами ответов. Верни JSON массив.'
        },
        {
          role: 'user',
          content: `На основе этого контекста создай 10 вопросов для теста:\n\n${context}\n\nВерни JSON в формате:\n[\n  {\n    "question": "текст вопроса",\n    "options": ["вариант1", "вариант2", "вариант3", "вариант4"],\n    "correctAnswer": 0\n  }\n]`
        }
      ],
      temperature: 0.7
    });

    // Парсим ответ
    let questions = JSON.parse(response.choices[0].message.content);

    // 4. Сохраняем вопросы в Supabase
    const testQuestions = questions.map((q, idx) => ({
      test_id: testId,
      question_text: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      order_num: idx + 1
    }));

    const { error: insertError } = await supabase
      .from('test_questions')
      .insert(testQuestions);

    if (insertError) throw insertError;

    res.json({
      success: true,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options
      }))
    });
  } catch (error) {
    console.error('Generate test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отправить ответы и получить результат
router.post('/submit', async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const userId = req.user.telegramId;

    // Получаем правильные ответы из Supabase
    const { data: questions, error: fetchError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_num', { ascending: true });

    if (fetchError) throw fetchError;

    // Подсчитываем правильные ответы
    let correctCount = 0;
    answers.forEach((userAnswer, idx) => {
      if (userAnswer === questions[idx].correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 85;

    // Сохраняем результат
    const { data: result, error: insertError } = await supabase
      .from('test_results')
      .insert([
        {
          user_id: userId,
          test_id: testId,
          score: score,
          passed: passed,
          answers: answers
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      score: score,
      passed: passed,
      resultId: result.id,
      correctAnswers: questions.map(q => q.correct_answer)
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;