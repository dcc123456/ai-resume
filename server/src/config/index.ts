// src/config/index.ts
require('dotenv').config();

interface AppConfig {
  port: number;
  jwt: { secret: string; expiresIn: string };
  db: { host: string; port: number; user: string; password: string; database: string };
  chroma: { url: string };
  llm: { provider: string; apiKey: string; baseUrl: string; model: string };
  upload: { dir: string; maxFileSize: number };
  rateLimit: { dailyGenerateLimit: number };
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'resume_user',
    password: process.env.DB_PASSWORD || 'resume_pass',
    database: process.env.DB_NAME || 'resume_ai',
  },
  chroma: {
    url: process.env.CHROMA_URL || 'http://localhost:8000',
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'minimax',
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.minimax.chat/v1',
    model: process.env.LLM_MODEL || 'minimax-m2.7',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
  rateLimit: {
    dailyGenerateLimit: parseInt(process.env.DAILY_GENERATE_LIMIT || '5', 10),
  },
};

export default config;
