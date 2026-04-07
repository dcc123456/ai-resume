// resume-ai/server/src/routes/generate.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { generateRateLimit, incrementGenerateCount } = require('../middleware/rateLimit');
const { generateCustomResume, updateResumeMarkdown, downloadResume, getGenerateHistory, deleteCustomResume } = require('../services/generateService');

const router = express.Router();

router.post('/from-jd/:jdId', authMiddleware, generateRateLimit, async (req, res) => {
  try {
    const result = await generateCustomResume(req.userId, parseInt(req.params.jdId, 10));
    await incrementGenerateCount(req.userId);
    res.json(result);
  } catch (err) {
    if (err.message === 'JD不存在' || err.message === '请先上传基础简历') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: '生成简历失败，请稍后重试' });
  }
});

router.put('/:resumeId', authMiddleware, async (req, res) => {
  try {
    const { markdown_text } = req.body;
    if (!markdown_text) return res.status(400).json({ error: '缺少 Markdown 内容' });
    res.json(await updateResumeMarkdown(req.userId, parseInt(req.params.resumeId, 10), markdown_text));
  } catch (err) { res.status(500).json({ error: '更新失败' }); }
});

router.post('/:resumeId/download', authMiddleware, async (req, res) => {
  try {
    const { format } = req.body;
    if (!['docx', 'pdf'].includes(format)) return res.status(400).json({ error: '不支持的格式' });
    const result = await downloadResume(req.userId, parseInt(req.params.resumeId, 10), format);
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(result.filename)}`);
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(result.buffer);
  } catch (err) {
    if (err.message === '简历不存在') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: '下载失败' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const jdId = req.query.jd_id ? parseInt(req.query.jd_id, 10) : null;
    res.json(await getGenerateHistory(req.userId, jdId));
  } catch (err) { res.status(500).json({ error: '获取历史记录失败' }); }
});

router.delete('/:resumeId', authMiddleware, async (req, res) => {
  try {
    const result = await deleteCustomResume(req.userId, parseInt(req.params.resumeId, 10));
    if (!result.success) return res.status(404).json({ error: '简历不存在' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: '删除失败' }); }
});

module.exports = router;
