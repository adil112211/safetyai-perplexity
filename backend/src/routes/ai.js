const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

// Chat с AI ассистентом
router.post('/ask', async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1. Поиск контекста в Pinecone
    const index = pc.Index(process.env.PINECONE_INDEX_NAME);

    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question
    });

    const searchResults = await index.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 3,
      includeMetadata: true
    });

    const context = searchResults.matches
      .map(match => match.metadata.text)
      .join('\n\n');

    // 2. Генерируем ответ через OpenAI
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `Контекст: ${context}\n\nВопрос: ${question}`
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по технике безопасности на производстве. Отвечай кратко и понятно, используя предоставленный контекст.'
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = response.choices[0].message.content;

    res.json({
      success: true,
      answer: answer,
      sources: searchResults.matches.map(m => m.id)
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;