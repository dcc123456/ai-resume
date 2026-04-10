// src/routes/profile.ts
// 用户资料路由

import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getUserProfile, updateUserProfile } from '../services/profileService';

const router = express.Router();

// 获取当前用户资料
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const profile = await getUserProfile(req.userId!);
    if (!profile) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json(profile);
  } catch (err: any) {
    console.error('[Profile] 获取资料失败:', err);
    res.status(500).json({ error: '获取资料失败' });
  }
});

// 更新当前用户资料
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, avatar_base64 } = req.body;

    // 验证数据
    if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
      res.status(400).json({ error: '名字格式不正确' });
      return;
    }

    if (avatar_base64 !== undefined && typeof avatar_base64 !== 'string') {
      res.status(400).json({ error: '头像格式不正确' });
      return;
    }

    // 如果提供了头像，验证是否为有效的 base64 图片
    if (avatar_base64 && avatar_base64.length > 0) {
      const isValidBase64 = avatar_base64.startsWith('data:image/') &&
        (avatar_base64.includes('base64,') || avatar_base64.length < 1024 * 1024 * 2); // 限制2MB
      if (!isValidBase64) {
        res.status(400).json({ error: '头像必须是有效的 base64 图片格式' });
        return;
      }
    }

    const success = await updateUserProfile(req.userId!, { name, avatar_base64 });
    if (!success) {
      res.status(400).json({ error: '更新失败' });
      return;
    }

    const updatedProfile = await getUserProfile(req.userId!);
    res.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    console.error('[Profile] 更新资料失败:', err);
    res.status(500).json({ error: '更新资料失败' });
  }
});

export default router;
