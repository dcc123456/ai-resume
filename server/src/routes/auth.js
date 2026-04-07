// resume-ai/server/src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { createUser, findUserByEmail, deleteUser } = require('../services/userService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: '邮箱和密码不能为空' });
  if (password.length < 6) return res.status(400).json({ error: '密码长度至少6位' });
  try {
    const user = await createUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    if (err.message === '该邮箱已注册') return res.status(409).json({ error: err.message });
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: '邮箱和密码不能为空' });
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: '邮箱或密码错误' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: '邮箱或密码错误' });
  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  res.json({ token, userId: user.id, email: user.email });
});

router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await deleteUser(req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除账号失败' });
  }
});

module.exports = router;
