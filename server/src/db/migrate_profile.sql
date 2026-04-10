-- 迁移脚本：添加用户资料和模板功能
USE resume_ai;

-- 1. 修改 users 表，添加 name 和 avatar_base64 字段
-- 检查列是否存在再添加（MySQL不支持IF NOT EXISTS语法）
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT NULL AFTER password_hash'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'avatar_base64';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN avatar_base64 MEDIUMTEXT DEFAULT NULL AFTER name'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. 创建 resume_templates 表
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

-- 3. 创建 user_template_preferences 表
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

-- 4. 插入默认模板
INSERT IGNORE INTO resume_templates (name, template_key, has_photo, sort_order) VALUES
  ('经典简历', 'classic', TRUE, 1),
  ('经典无照片', 'classic_no_photo', FALSE, 2),
  ('现代风格', 'modern', TRUE, 3),
  ('专业经典', 'professional', TRUE, 4),
  ('极简主义', 'minimalist', FALSE, 5),
  ('创意信息图', 'creative', TRUE, 6);

SELECT 'Migration completed successfully!' AS status;
