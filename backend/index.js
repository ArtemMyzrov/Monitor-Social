require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dbHelpers } = require('./database');
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

app.get('/api/keywords', async (req, res) => {
  try {
    const keywords = vkController.getKeywords();
    res.json({ success: true, keywords });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/keywords', async (req, res) => {
  try {
    const { keywords } = req.body;
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords must be an array' });
    }

    const updatedKeywords = vkController.updateKeywords(keywords);
    res.json({ success: true, keywords: updatedKeywords });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// endpoints для управления группами
app.get('/api/groups', async (req, res) => {
  try {
    const groups = vkController.getGroups();
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/groups', async (req, res) => {
  try {
    const { groups } = req.body;
    if (!groups || !Array.isArray(groups)) {
      return res.status(400).json({ error: 'Groups must be an array' });
    }

    const updatedGroups = vkController.updateGroups(groups);
    res.json({ success: true, groups: updatedGroups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/groups/test', async (req, res) => {
  try {
    const { screenName } = req.body;
    if (!screenName) {
      return res.status(400).json({ error: 'Screen name is required' });
    }

    const groupInfo = await vkController.testGroup(screenName);
    res.json({ success: true, group: groupInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Mentions API: http://localhost:${PORT}/api/mentions`);
});