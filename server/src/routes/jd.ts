// src/routes/jd.ts
import express from 'express';
import multer from 'multer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import config from '../config';
import { parseJD, saveJD, getJDList, deleteJD } from '../services/jdService';

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
    let result;
    if (req.file) result = await parseJD('', req.file);
    else if (req.body.text) result = await parseJD(req.body.text);
    else { res.status(400).json({ error: '请上传JD文件或粘贴JD文本' }); return; }
    res.json(result);
  } catch (err: any) {
    if (err.message?.includes('不支持的文件类型') || err.message?.includes('无法解析文件')) { res.status(400).json({ error: err.message }); return; }
    res.status(500).json({ error: 'JD解析失败，请稍后重试' });
  }
});

// /jd/parse 别名，支持 JSON body 格式
router.post('/parse', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
    if (!text) { res.status(400).json({ error: '请提供 JD 文本' }); return; }
    const result = await parseJD(text);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'JD解析失败，请稍后重试' });
  }
});

router.post('/save', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { original_text, parsed_json } = req.body;
    if (!original_text || !parsed_json) { res.status(400).json({ error: '缺少JD数据' }); return; }
    res.json(await saveJD(req.userId!, original_text, parsed_json));
  } catch { res.status(500).json({ error: '保存JD失败' }); }
});

router.get('/list', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const size = parseInt(req.query.size as string, 10) || 10;
    res.json(await getJDList(req.userId!, page, size));
  } catch (err: any) { console.error('[JD列表错误]', err.message || err); res.status(500).json({ error: '获取JD列表失败' }); }
});

router.delete('/:jdId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await deleteJD(req.userId!, parseInt(Array.isArray(req.params.jdId) ? req.params.jdId[0] : req.params.jdId, 10));
    if (!result.success) { res.status(404).json({ error: 'JD不存在' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: '删除JD失败' }); }
});

export default router;
