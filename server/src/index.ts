// src/index.ts
import express from 'express';
import cors from 'cors';
import config from './config';
import path from 'path';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import jdRoutes from './routes/jd';
import generateRoutes from './routes/generate';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/jd', jdRoutes);
app.use('/api/v1/generate', generateRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`服务器运行在端口 ${config.port}`);
});

export default app;
