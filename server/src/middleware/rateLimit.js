// resume-ai/server/src/middleware/rateLimit.js
const db = require('../db/connection');
const config = require('../config');

async function generateRateLimit(req, res, next) {
  try {
    const rows = await db.query('SELECT daily_generate_count, created_at FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(401).json({ error: '用户不存在' });
    const user = rows[0];
    const today = new Date().toISOString().slice(0, 10);
    const userDate = new Date(user.created_at).toISOString().slice(0, 10);
    let count = userDate === today ? user.daily_generate_count : 0;
    if (count >= config.rateLimit.dailyGenerateLimit) {
      return res.status(429).json({ error: `每日生成次数已达上限（${config.rateLimit.dailyGenerateLimit}次），请明天再试` });
    }
    req._generateCount = count;
    next();
  } catch (err) {
    console.error('限流检查错误:', err);
    next();
  }
}

async function incrementGenerateCount(userId) {
  const today = new Date().toISOString().slice(0, 10);
  await db.query(
    'UPDATE users SET daily_generate_count = daily_generate_count + 1, created_at = ? WHERE id = ? AND DATE(created_at) != ?',
    [new Date(), userId, today]
  );
}

module.exports = { generateRateLimit, incrementGenerateCount };
