// src/services/templateService.ts
// 模板服务

import { query } from '../db/connection';
import { templateRegistry } from '../utils/templateRegistry';

export interface TemplateInfo {
  id: number;
  name: string;
  template_key: string;
  thumbnail_url: string | null;
  has_photo: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface TemplatePreference {
  template_id: number;
  include_photo: boolean;
}

export async function listActiveTemplates(): Promise<TemplateInfo[]> {
  const rows = await query(
    'SELECT * FROM resume_templates WHERE is_active = TRUE ORDER BY sort_order ASC'
  );
  return rows as TemplateInfo[];
}

export async function getTemplateById(id: number): Promise<TemplateInfo | null> {
  const rows = await query(
    'SELECT * FROM resume_templates WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return rows.length > 0 ? (rows[0] as TemplateInfo) : null;
}

export async function getTemplateByKey(key: string): Promise<TemplateInfo | null> {
  const rows = await query(
    'SELECT * FROM resume_templates WHERE template_key = ? AND is_active = TRUE',
    [key]
  );
  return rows.length > 0 ? (rows[0] as TemplateInfo) : null;
}

export async function getUserTemplatePreference(userId: number): Promise<TemplatePreference | null> {
  const rows = await query(
    'SELECT template_id, include_photo FROM user_template_preferences WHERE user_id = ?',
    [userId]
  );
  if (rows.length === 0) {
    // 返回默认模板
    const defaultTemplates = await listActiveTemplates();
    if (defaultTemplates.length > 0) {
      return {
        template_id: defaultTemplates[0].id,
        include_photo: true,
      };
    }
    return null;
  }
  return rows[0] as TemplatePreference;
}

export async function setUserTemplatePreference(
  userId: number,
  templateId: number,
  includePhoto: boolean
): Promise<boolean> {
  // 检查模板是否存在
  const template = await getTemplateById(templateId);
  if (!template) return false;

  // 使用 REPLACE INTO 实现插入或更新
  await query(
    `REPLACE INTO user_template_preferences (user_id, template_id, include_photo)
     VALUES (?, ?, ?)`,
    [userId, templateId, includePhoto]
  );

  return true;
}

// 获取渲染后的HTML（用于预览）
export function renderTemplate(
  templateKey: string,
  data: any,
  options?: { includePhoto?: boolean }
): string | null {
  const template = templateRegistry.get(templateKey);
  if (!template) return null;
  return template.render(data, options);
}
