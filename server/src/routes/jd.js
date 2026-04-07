// resume-ai/server/src/routes/jd.js
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const config = require('../config');
const { parseJD, saveJD, getJDList, deleteJD } = require('../services/jdService');

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
    let result;
    if (req.file) result = await parseJD(null, req.file);
    else if (req.body.text) result = await parseJD(req.body.text);
    else return res.status(400).json({ error: '请上传JD文件或粘贴JD文本' });
    res.json(result);
  } catch (err) {
    if (err.message.includes('不支持的文件类型') || err.message.includes('无法解析文件')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'JD解析失败，请稍后重试' });
  }
});

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { original_text, parsed_json } = req.body;
    if (!original_text || !parsed_json) return res.status(400).json({ error: '缺少JD数据' });
    res.json(await saveJD(req.userId, original_text, parsed_json));
  } catch (err) { res.status(500).json({ error: '保存JD失败' }); }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 10;
    res.json(await getJDList(req.userId, page, size));
  } catch (err) { res.status(500).json({ error: '获取JD列表失败' }); }
});

router.delete('/:jdId', authMiddleware, async (req, res) => {
  try {
    const result = await deleteJD(req.userId, parseInt(req.params.jdId, 10));
    if (!result.success) return res.status(404).json({ error: 'JD不存在' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: '删除JD失败' }); }
});

module.exports = router;
