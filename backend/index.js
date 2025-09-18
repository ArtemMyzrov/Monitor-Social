require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
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


app.get('/api/mentions', (req, res) => {
  const sql = 'SELECT * FROM mentions ORDER BY date_found DESC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


app.post('/api/mentions', (req, res) => {
  const { text, source, url } = req.body;

  if (!text || !source || !url) {
    return res.status(400).json({ error: 'Missing required fields: text, source, url' });
  }

  const sql = 'INSERT OR IGNORE INTO mentions (text, source, url) VALUES (?, ?, ?)';

  db.run(sql, [text, source, url], function (err) {
    if (err) {
      console.error('Insert error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      message: 'Mention added successfully',
      text, source, url
    });
  });
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

// Ручной запуск мониторинга
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