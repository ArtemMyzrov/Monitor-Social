const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Основная таблица упоминаний с полем date
  db.run(`CREATE TABLE IF NOT EXISTS mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    date_found DATETIME DEFAULT CURRENT_TIMESTAMP,
    date DATETIME, -- ✅ ДАТА ПУБЛИКАЦИИ ИЗ VK
    vk_post_id TEXT,
    likes INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0
  )`);

  // Таблица ключевых слов
  db.run(`CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ Database tables initialized with correct structure');
});

// Helpers для работы с БД
const dbHelpers = {
  // Сохранение упоминания С ДАТОЙ
  saveMention: function (mentionData) {
    return new Promise((resolve, reject) => {
      const {
        text,
        source,
        url,
        vk_post_id,
        likes = 0,
        reposts = 0,
        views = 0,
        date // ✅ ВКЛЮЧАЕМ ДАТУ
      } = mentionData;

      db.run(
        `INSERT OR IGNORE INTO mentions 
         (text, source, url, vk_post_id, likes, reposts, views, date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [text, source, url, vk_post_id, likes, reposts, views, date],
        function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`💾 Сохранен пост с датой: ${date}`);
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // 🔥 ИСПРАВЛЕННАЯ СОРТИРОВКА - по дате из VK (date), а не date_found
  getAllMentions: function () {
    return new Promise((resolve, reject) => {
      db.all(
        // 🔥 СОРТИРУЕМ ПО ДАТЕ ИЗ VK, ЕСЛИ ОНА ЕСТЬ, ИНАЧЕ ПО date_found
        `SELECT * FROM mentions 
         ORDER BY COALESCE(date, date_found) DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Альтернативный вариант - только по дате из VK
  getAllMentionsByVkDate: function () {
    return new Promise((resolve, reject) => {
      db.all(
        // 🔥 СТРОГО ПО ДАТЕ ИЗ VK
        `SELECT * FROM mentions 
         ORDER BY date DESC NULLS LAST, date_found DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Получение самого последнего упоминания
  getLatestMention: function () {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM mentions 
         ORDER BY COALESCE(date, date_found) DESC 
         LIMIT 1`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
};

module.exports = { db, dbHelpers };