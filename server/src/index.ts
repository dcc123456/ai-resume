// src/index.ts
import express from 'express';
import cors from 'cors';
import config from './config';
import path from 'path';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import jdRoutes from './routes/jd';
import generateRoutes from './routes/generate';
import profileRoutes from './routes/profile';
import templateRoutes from './routes/template';
import { seedOnStartup } from './db/seedTemplates';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/jd', jdRoutes);
app.use('/api/v1/generate', generateRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/templates', templateRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, async () => {
  console.log(`服务器运行在端口 ${config.port}`);
  // 启动时播种模板数据
  await seedOnStartup();
});

export default app;
