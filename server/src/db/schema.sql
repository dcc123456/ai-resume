CREATE DATABASE IF NOT EXISTS resume_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resume_ai;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  daily_generate_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS base_resume (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  raw_text TEXT NOT NULL,
  structured_json JSON NOT NULL,
  original_file_url VARCHAR(500),
  photo_base64 MEDIUMTEXT,
  text_hash VARCHAR(64),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_description (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_text TEXT NOT NULL,
  parsed_json JSON NOT NULL,
  keyword_match_rate TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS custom_resume (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  jd_id INT NOT NULL,
  generated_json JSON NOT NULL,
  markdown_text TEXT NOT NULL,
  fact_check_report JSON,
  keyword_match_rate TINYINT NOT NULL DEFAULT 0,
  download_url_docx VARCHAR(500),
  download_url_pdf VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jd_id) REFERENCES job_description(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 简历模板表
CREATE TABLE IF NOT EXISTS resume_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '模板显示名称',
  template_key VARCHAR(50) NOT NULL UNIQUE COMMENT '模板代码标识',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT '预览图路径',
  has_photo BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否支持头像',
  css_override TEXT DEFAULT NULL COMMENT '可选的CSS覆盖(JSON格式)',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户模板偏好表
CREATE TABLE IF NOT EXISTS user_template_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  include_photo BOOLEAN NOT NULL DEFAULT TRUE COMMENT '用户可覆盖模板的头像设置',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES resume_templates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_pref (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 以下为已有数据库需要执行的ALTER命令（如不需要可跳过）
-- =====================================================
-- ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT NULL AFTER password_hash;
-- ALTER TABLE users ADD COLUMN avatar_base64 MEDIUMTEXT DEFAULT NULL AFTER name;
