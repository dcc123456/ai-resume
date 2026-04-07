// resume-ai/server/src/routes/resume.js
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const config = require('../config');
const { uploadAndParseResume, saveBaseResume, getBaseResume, downloadRawResume } = require('../services/resumeService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传文件' });
    const result = await uploadAndParseResume(req.file, req.userId);
    res.json(result);
  } catch (err) {
    if (err.message.includes('不支持的文件类型') || err.message.includes('无法解析文件')) return res.status(400).json({ error: err.message });
    console.error('简历上传错误:', err);
    res.status(500).json({ error: '简历解析失败，请稍后重试' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const { structured_json, raw_text, file_path } = req.body;
    if (!structured_json) return res.status(400).json({ error: '缺少结构化简历数据' });
    res.json(await saveBaseResume(req.userId, structured_json, raw_text, file_path));
  } catch (err) { res.status(500).json({ error: '保存简历失败' }); }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const resume = await getBaseResume(req.userId);
    if (!resume) return res.status(404).json({ error: '尚未上传基础简历' });
    res.json({ structured_json: resume.structured_json });
  } catch (err) { res.status(500).json({ error: '获取简历失败' }); }
});

router.get('/download/raw', authMiddleware, async (req, res) => {
  try {
    const result = await downloadRawResume(req.userId);
    if (!result || !result.filePath) return res.status(404).json({ error: '未找到原始简历文件' });
    res.download(result.filePath);
  } catch (err) { res.status(500).json({ error: '下载失败' }); }
});

module.exports = router;
