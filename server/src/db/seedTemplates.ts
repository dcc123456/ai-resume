// src/db/seedTemplates.ts
// 模板数据播种脚本

import { query } from './connection';
import { templateRegistry } from '../utils/templateRegistry';

export async function seedTemplates(): Promise<void> {
  console.log('[Seed] 开始播种模板数据...');

  const templates = [
    { name: '经典简历', key: 'classic', has_photo: true, sort_order: 1 },
    { name: '经典无照片', key: 'classic_no_photo', has_photo: false, sort_order: 2 },
    { name: '现代风格', key: 'modern', has_photo: true, sort_order: 3 },
    { name: '专业经典', key: 'professional', has_photo: true, sort_order: 4 },
    { name: '极简主义', key: 'minimalist', has_photo: false, sort_order: 5 },
    { name: '创意信息图', key: 'creative', has_photo: true, sort_order: 6 },
  ];

  for (const tmpl of templates) {
    try {
      // 使用 INSERT IGNORE 避免重复插入
      await query(
        `INSERT IGNORE INTO resume_templates (name, template_key, has_photo, sort_order) VALUES (?, ?, ?, ?)`,
        [tmpl.name, tmpl.key, tmpl.has_photo, tmpl.sort_order]
      );
      console.log(`[Seed] 模板 "${tmpl.name}" 已添加或已存在`);
    } catch (err) {
      console.error(`[Seed] 添加模板 "${tmpl.name}" 失败:`, err);
    }
  }

  // 验证
  const rows = await query('SELECT * FROM resume_templates ORDER BY sort_order');
  console.log(`[Seed] 当前数据库中有 ${(rows as any[]).length} 个模板`);
}

export async function seedOnStartup(): Promise<void> {
  try {
    // 检查是否已经有模板数据
    const rows = await query('SELECT COUNT(*) as cnt FROM resume_templates') as any[];
    if (rows[0].cnt === 0) {
      console.log('[Seed] 数据库为空，开始播种...');
      await seedTemplates();
    } else {
      console.log(`[Seed] 数据库已有 ${rows[0].cnt} 个模板，跳过播种`);
    }
  } catch (err) {
    console.error('[Seed] 播种检查失败:', err);
  }
}
