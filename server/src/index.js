// resume-ai/server/src/index.js
const express = require('express');
const cors = require('cors');
const config = require('./config');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

// 路由
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/resume', require('./routes/resume'));
app.use('/api/v1/jd', require('./routes/jd'));
app.use('/api/v1/generate', require('./routes/generate'));

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`服务器运行在端口 ${config.port}`);
});

module.exports = app;
