// src/services/generateService.ts
import { query } from '../db/connection';
import { getLLM } from '../llm';
import { SYSTEM_PROMPT, buildGeneratePrompt, RETRY_APPEND } from '../prompts/resumeGenerate';
import { factCheck } from './factCheckService';
import { computeKeywordMatchRate, getMissingKeywords } from './keywordService';
import { renderMarkdown } from '../utils/markdownRenderer';
import { generateDocxBuffer } from '../utils/docxGenerator';
import { saveFile } from './fileService';
import { marked } from 'marked';
import { generatePdfBuffer } from '../utils/pdfGenerator';
import { generatePdfCompact } from '../utils/pdfGeneratorFromTemplate';
import { buildHtmlResume, templateRegistry } from '../utils/templateRegistry';
import { getUserTemplatePreference } from './templateService';
import { htmlToPdfBuffer } from '../utils/htmlToPdf';

export async function generateCustomResume(userId: number, jdId: number) {
  const jds = await query('SELECT * FROM job_description WHERE id=? AND user_id=?', [jdId, userId]);
  if (jds.length === 0) throw new Error('JD不存在');
  const bases = await query('SELECT * FROM base_resume WHERE user_id=?', [userId]);
  if (bases.length === 0) throw new Error('请先上传基础简历');
  const jd = jds[0], base = bases[0];
  const baseJson = typeof base.structured_json === 'string' ? JSON.parse(base.structured_json) : base.structured_json;
  const jdParsed = typeof jd.parsed_json === 'string' ? JSON.parse(jd.parsed_json) : jd.parsed_json;
  const photoBase64 = base.photo_base64 || null;
  const llm = getLLM();
  const prompt = buildGeneratePrompt(jd.original_text, baseJson);
  let { parsed: generatedJson } = await llm.chat(SYSTEM_PROMPT, prompt, { responseFormat: 'json' });
  // 保留原始简历头像
  if (photoBase64) {
    generatedJson.photo_base64 = photoBase64;
  }
  let factReport = factCheck(generatedJson, baseJson);
  if (factReport.hasIssues) {
    const retryResult = await llm.chat(SYSTEM_PROMPT, prompt + RETRY_APPEND, { responseFormat: 'json' });
    generatedJson = retryResult.parsed;
    factReport = factCheck(generatedJson, baseJson);
  }
  const markdown = renderMarkdown(generatedJson);
  const matchRate = computeKeywordMatchRate(markdown, jdParsed.hard_skills);
  const missingKeywords = getMissingKeywords(markdown, jdParsed.hard_skills);
  const result = await query('INSERT INTO custom_resume (user_id, jd_id, generated_json, markdown_text, fact_check_report, keyword_match_rate) VALUES (?,?,?,?,?,?)', [userId, jdId, JSON.stringify(generatedJson), markdown, JSON.stringify(factReport), matchRate]);
  return { resume_id: (result as any).insertId, generated_json: generatedJson, markdown, fact_check_report: factReport, keyword_match_rate: matchRate, missing_keywords: missingKeywords };
}

export async function updateResumeMarkdown(userId: number, resumeId: number, markdownText: string) {
  await query('UPDATE custom_resume SET markdown_text=? WHERE id=? AND user_id=?', [markdownText, resumeId, userId]);
  return { success: true };
}

interface DownloadOptions {
  format: string;
  template_id?: number;
  include_photo?: boolean;
}

export async function downloadResume(userId: number, resumeId: number, options: DownloadOptions) {
  const { format, template_id, include_photo } = options;

  const resumes = await query('SELECT * FROM custom_resume WHERE id=? AND user_id=?', [resumeId, userId]);
  if (resumes.length === 0) throw new Error('简历不存在');
  const resume = resumes[0];

  if (format === 'docx') {
    const buffer = await generateDocxBuffer(resume.markdown_text);
    const filePath = saveFile(buffer, `resume_${resumeId}.docx`, userId);
    await query('UPDATE custom_resume SET download_url_docx=? WHERE id=?', [filePath, resumeId]);
    return { filename: `resume_${resumeId}.docx`, buffer };
  }

  if (format === 'pdf') {
    const generatedJson = typeof resume.generated_json === 'string' ? JSON.parse(resume.generated_json) : resume.generated_json;

    // 获取用户的模板偏好设置
    let useTemplateKey = 'classic';
    let useIncludePhoto = include_photo ?? true;

    if (template_id) {
      // 如果指定了模板ID，从数据库获取模板信息
      const { getTemplateById } = await import('./templateService');
      const template = await getTemplateById(template_id);
      if (template) {
        useTemplateKey = template.template_key;
      }
    } else {
      // 使用用户的默认模板偏好
      const preference = await getUserTemplatePreference(userId);
      if (preference) {
        const { getTemplateById: getTplById } = await import('./templateService');
        const template = await getTplById(preference.template_id);
        if (template) {
          useTemplateKey = template.template_key;
        }
        // 如果没有显式传入 include_photo，使用用户偏好
        if (include_photo === undefined) {
          useIncludePhoto = preference.include_photo;
        }
      }
    }

    // 使用模板系统生成 HTML
    const template = templateRegistry.get(useTemplateKey);
    if (!template) {
      throw new Error('模板不存在');
    }

    const html = template.render(generatedJson, { includePhoto: useIncludePhoto });
    const buffer = await htmlToPdfBuffer(html);
    const filePath = saveFile(buffer, `resume_${resumeId}.pdf`, userId);
    await query('UPDATE custom_resume SET download_url_pdf=? WHERE id=?', [filePath, resumeId]);
    return { filename: `resume_${resumeId}.pdf`, buffer };
  }

  throw new Error('不支持的格式');
}

export async function getGenerateHistory(userId: number, jdId: number | null = null) {
  let sql = 'SELECT cr.id, cr.jd_id, jd.parsed_json, cr.created_at, cr.keyword_match_rate FROM custom_resume cr LEFT JOIN job_description jd ON cr.jd_id=jd.id WHERE cr.user_id=?';
  const params: any[] = [userId];
  if (jdId) { sql += ' AND cr.jd_id=?'; params.push(jdId); }
  sql += ' ORDER BY cr.created_at DESC';
  const rows = await query(sql, params);
  return { items: rows.map((r: any) => ({ resume_id: r.id, jd_title: r.parsed_json?.title || '未命名', created_at: r.created_at, match_rate: r.keyword_match_rate })) };
}

export async function deleteCustomResume(userId: number, resumeId: number) {
  const result = await query('DELETE FROM custom_resume WHERE id=? AND user_id=?', [resumeId, userId]);
  return { success: (result as any).affectedRows > 0 };
}
