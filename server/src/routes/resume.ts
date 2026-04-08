// src/routes/resume.ts
import express from 'express';
import multer from 'multer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import config from '../config';
import { uploadAndParseResume, saveBaseResume, getBaseResume, downloadRawResume } from '../services/resumeService';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: '请上传文件' }); return; }
    const result = await uploadAndParseResume(req.file, req.userId!);
    res.json(result);
  } catch (err: any) {
    console.error('[简历上传错误]', err.message || err, err.stack || '');
    if (err.message?.includes('不支持的文件类型') || err.message?.includes('无法解析文件')) { res.status(400).json({ error: err.message }); return; }
    res.status(500).json({ error: '简历解析失败，请稍后重试' });
  }
});

router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { structured_json, raw_text, file_path } = req.body;
    if (!structured_json) { res.status(400).json({ error: '缺少结构化简历数据' }); return; }
    res.json(await saveBaseResume(req.userId!, structured_json, raw_text, file_path));
  } catch { res.status(500).json({ error: '保存简历失败' }); }
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const resume = await getBaseResume(req.userId!);
    if (!resume) { res.status(404).json({ error: '尚未上传基础简历' }); return; }
    res.json({ structured_json: resume.structured_json });
  } catch { res.status(500).json({ error: '获取简历失败' }); }
});

router.get('/download/raw', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await downloadRawResume(req.userId!);
    if (!result || !result.filePath) { res.status(404).json({ error: '未找到原始简历文件' }); return; }
    res.download(result.filePath);
  } catch { res.status(500).json({ error: '下载失败' }); }
});

export default router;
