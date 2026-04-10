-- SQLite schema for resume_ai

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  daily_generate_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS base_resume (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  raw_text TEXT NOT NULL,
  structured_json TEXT NOT NULL,
  original_file_url VARCHAR(500),
  photo_base64 TEXT,
  text_hash VARCHAR(64),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_description (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  original_text TEXT NOT NULL,
  parsed_json TEXT NOT NULL,
  keyword_match_rate INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_resume (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  jd_id INTEGER NOT NULL,
  generated_json TEXT NOT NULL,
  markdown_text TEXT NOT NULL,
  fact_check_report TEXT,
  keyword_match_rate INTEGER NOT NULL DEFAULT 0,
  download_url_docx VARCHAR(500),
  download_url_pdf VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jd_id) REFERENCES job_description(id) ON DELETE CASCADE
);

-- 简历模板表
CREATE TABLE IF NOT EXISTS resume_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  template_key VARCHAR(50) NOT NULL UNIQUE,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  has_photo INTEGER NOT NULL DEFAULT 1,
  css_override TEXT DEFAULT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户模板偏好表
CREATE TABLE IF NOT EXISTS user_template_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  include_photo INTEGER NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES resume_templates(id) ON DELETE CASCADE,
  UNIQUE (user_id)
);

-- =====================================================
-- 以下为已有数据库需要执行的ALTER命令（如不需要可跳过）
-- =====================================================
-- ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN avatar_base64 TEXT DEFAULT NULL;
