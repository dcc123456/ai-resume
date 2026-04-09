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
    console.log(`[简历路由] 收到上传请求，用户ID: ${req.userId}`);
    console.log(`[简历路由] 请求内容类型: ${req.contentType}`);
    console.log(`[简历路由] 文件信息:`, req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : '无文件');
    
    if (!req.file) { 
      console.warn('[简历路由] 未检测到上传文件');
      res.status(400).json({ error: '请上传文件' }); 
      return; 
    }
    
    console.log(`[简历路由] 开始调用 uploadAndParseResume...`);
    const result = await uploadAndParseResume(req.file, req.userId!);
    console.log(`[简历路由] 解析成功，返回结果`);
    res.json(result);
  } catch (err: any) {
    console.error('========================================');
    console.error('[简历路由] 上传处理失败:', err.message);
    console.error('[简历路由] 错误名称:', err.name);
    console.error('[简历路由] 错误堆栈:', err.stack);
    console.error('========================================');
    
    if (err.message?.includes('不支持的文件类型') || err.message?.includes('无法解析文件') || err.message?.includes('PDF 解析失败')) { 
      res.status(400).json({ error: err.message }); 
      return; 
    }
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
