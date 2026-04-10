// src/routes/template.ts
// 模板路由

import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  listActiveTemplates,
  getUserTemplatePreference,
  setUserTemplatePreference,
  renderTemplate,
} from '../services/templateService';
import { templateRegistry } from '../utils/templateRegistry';

const router = express.Router();

// 获取所有可用模板列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const templates = await listActiveTemplates();
    res.json({ templates });
  } catch (err: any) {
    console.error('[Template] 获取模板列表失败:', err);
    res.status(500).json({ error: '获取模板列表失败' });
  }
});

// 获取用户模板偏好
router.get('/preference', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const preference = await getUserTemplatePreference(req.userId!);
    if (!preference) {
      res.status(404).json({ error: '未找到模板偏好' });
      return;
    }
    res.json(preference);
  } catch (err: any) {
    console.error('[Template] 获取模板偏好失败:', err);
    res.status(500).json({ error: '获取模板偏好失败' });
  }
});

// 设置用户模板偏好
router.put('/preference', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { template_id, include_photo } = req.body;

    if (!template_id || typeof template_id !== 'number') {
      res.status(400).json({ error: '缺少 template_id' });
      return;
    }

    // 接受 boolean (true/false) 或 number (1/0)
    if (include_photo == null || (typeof include_photo !== 'boolean' && typeof include_photo !== 'number')) {
      res.status(400).json({ error: '缺少 include_photo 参数' });
      return;
    }

    // 转换为 boolean
    const includePhotoBoolean = Boolean(include_photo);

    const success = await setUserTemplatePreference(req.userId!, template_id, includePhotoBoolean);
    if (!success) {
      res.status(400).json({ error: '模板不存在' });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('[Template] 设置模板偏好失败:', err);
    res.status(500).json({ error: '设置模板偏好失败' });
  }
});

// 预览模板渲染结果
router.post('/preview', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { template_key, data, include_photo } = req.body;

    if (!template_key || typeof template_key !== 'string') {
      res.status(400).json({ error: '缺少 template_key' });
      return;
    }

    const html = renderTemplate(template_key, data, { includePhoto: include_photo });
    if (!html) {
      res.status(400).json({ error: '模板不存在' });
      return;
    }

    res.json({ html });
  } catch (err: any) {
    console.error('[Template] 预览模板失败:', err);
    res.status(500).json({ error: '预览模板失败' });
  }
});

export default router;
