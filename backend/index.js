require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, dbHelpers } = require('./database'); // Правильный импорт
const vkController = require('./controllers/vkController');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Social Monitor API!' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Social Monitor Backend'
  });
});

// Обновленный endpoint для получения упоминаний
app.get('/api/mentions', async (req, res) => {
  try {
    const mentions = await dbHelpers.getAllMentions();
    res.json(mentions);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Обновленный endpoint для добавления упоминаний
app.post('/api/mentions', async (req, res) => {
  try {
    const { text, source, url, vk_post_id, likes, reposts, views } = req.body;

    if (!text || !source || !url) {
      return res.status(400).json({ error: 'Missing required fields: text, source, url' });
    }

    const mentionId = await dbHelpers.saveMention({
      text,
      source,
      url,
      vk_post_id,
      likes,
      reposts,
      views
    });

    res.json({
      id: mentionId,
      message: 'Mention added successfully',
      text, source, url
    });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vk/monitor-saratov', async (req, res) => {
  try {
    const posts = await vkController.monitorSaratov();
    res.json({
      success: true,
      postsFound: posts.length,
      message: `Найдено ${posts.length} постов о Саратове`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/vk/monitor', async (req, res) => {
  try {
    const { keywords } = req.body;
    const posts = await vkController.monitorSaratov();
    res.json({ success: true, postsFound: posts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Mentions API: http://localhost:${PORT}/api/mentions`);
});