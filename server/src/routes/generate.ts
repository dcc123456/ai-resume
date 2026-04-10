// src/routes/generate.ts
import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateRateLimit, incrementGenerateCount } from '../middleware/rateLimit';
import { generateCustomResume, updateResumeMarkdown, downloadResume, getGenerateHistory, deleteCustomResume } from '../services/generateService';

const router = express.Router();

// 辅助函数：将路由参数安全转为字符串
function paramToStr(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

router.post('/from-jd/:jdId', authMiddleware, generateRateLimit, async (req: AuthRequest, res) => {
  try {
    const result = await generateCustomResume(req.userId!, parseInt(paramToStr(req.params.jdId), 10));
    await incrementGenerateCount(req.userId!);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'JD不存在' || err.message === '请先上传基础简历') { res.status(400).json({ error: err.message }); return; }
    res.status(500).json({ error: '生成简历失败，请稍后重试' });
  }
});

router.put('/:resumeId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { markdown_text } = req.body;
    if (!markdown_text) { res.status(400).json({ error: '缺少 Markdown 内容' }); return; }
    res.json(await updateResumeMarkdown(req.userId!, parseInt(paramToStr(req.params.resumeId), 10), markdown_text));
  } catch { res.status(500).json({ error: '更新失败' }); }
});

router.post('/:resumeId/download', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { format, template_id, include_photo } = req.body;
    if (!['docx', 'pdf'].includes(format)) { res.status(400).json({ error: '不支持的格式' }); return; }

    const result = await downloadResume(req.userId!, parseInt(paramToStr(req.params.resumeId), 10), {
      format,
      template_id,
      include_photo,
    });
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(result.filename)}`);
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(result.buffer);
  } catch (err: any) {
    if (err.message === '简历不存在') { res.status(404).json({ error: err.message }); return; }
    if (err.message === '模板不存在') { res.status(400).json({ error: err.message }); return; }
    res.status(500).json({ error: '下载失败' });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const jdId = req.query.jd_id ? parseInt(req.query.jd_id as string, 10) : null;
    res.json(await getGenerateHistory(req.userId!, jdId));
  } catch { res.status(500).json({ error: '获取历史记录失败' }); }
});

router.delete('/:resumeId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await deleteCustomResume(req.userId!, parseInt(paramToStr(req.params.resumeId), 10));
    if (!result.success) { res.status(404).json({ error: '简历不存在' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: '删除失败' }); }
});

export default router;
