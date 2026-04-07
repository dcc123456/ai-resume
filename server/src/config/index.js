// resume-ai/server/src/config/index.js
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
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
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
  },
  rateLimit: {
    dailyGenerateLimit: parseInt(process.env.DAILY_GENERATE_LIMIT, 10) || 5,
  },
};
