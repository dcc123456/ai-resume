// src/routes/auth.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { createUser, findUserByEmail, deleteUser } from '../services/userService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: '邮箱和密码不能为空' }); return; }
  if (password.length < 6) { res.status(400).json({ error: '密码长度至少6位' }); return; }
  try {
    const user = await createUser(email, password);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === '该邮箱已注册') { res.status(409).json({ error: err.message }); return; }
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: '邮箱和密码不能为空' }); return; }
  const user = await findUserByEmail(email);
  if (!user) { res.status(401).json({ error: '邮箱或密码错误' }); return; }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) { res.status(401).json({ error: '邮箱或密码错误' }); return; }
  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
  res.json({ token, userId: user.id, email: user.email });
});

router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await deleteUser(req.userId!);
    res.json({ success: true });
  } catch { res.status(500).json({ error: '删除账号失败' }); }
});

export default router;
