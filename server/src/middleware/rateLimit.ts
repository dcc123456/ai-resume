// src/middleware/rateLimit.ts
import { Response, NextFunction } from 'express';
import { query } from '../db/connection';
import config from '../config';
import { AuthRequest } from './auth';

export async function generateRateLimit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await query('SELECT daily_generate_count, created_at FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      res.status(401).json({ error: '用户不存在' });
      return;
    }
    const user = rows[0];
    const today = new Date().toISOString().slice(0, 10);
    const userDate = new Date(user.created_at).toISOString().slice(0, 10);
    const count = userDate === today ? user.daily_generate_count : 0;
    if (count >= config.rateLimit.dailyGenerateLimit) {
      res.status(429).json({ error: `每日生成次数已达上限（${config.rateLimit.dailyGenerateLimit}次），请明天再试` });
      return;
    }
    req._generateCount = count;
    next();
  } catch (err) {
    console.error('限流检查错误:', err);
    next();
  }
}

export async function incrementGenerateCount(userId: number): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await query(
    'UPDATE users SET daily_generate_count = daily_generate_count + 1, created_at = ? WHERE id = ? AND DATE(created_at) != ?',
    [new Date(), userId, today]
  );
}
