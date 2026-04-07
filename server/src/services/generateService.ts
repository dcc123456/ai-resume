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
import puppeteer from 'puppeteer';

export async function generateCustomResume(userId: number, jdId: number) {
  const jds = await query('SELECT * FROM job_description WHERE id=? AND user_id=?', [jdId, userId]);
  if (jds.length === 0) throw new Error('JD不存在');
  const bases = await query('SELECT * FROM base_resume WHERE user_id=?', [userId]);
  if (bases.length === 0) throw new Error('请先上传基础简历');
  const jd = jds[0], base = bases[0];
  const baseJson = typeof base.structured_json === 'string' ? JSON.parse(base.structured_json) : base.structured_json;
  const jdParsed = typeof jd.parsed_json === 'string' ? JSON.parse(jd.parsed_json) : jd.parsed_json;
  const llm = getLLM();
  const prompt = buildGeneratePrompt(jd.original_text, baseJson);
  let { parsed: generatedJson } = await llm.chat(SYSTEM_PROMPT, prompt, { responseFormat: 'json' });
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

export async function downloadResume(userId: number, resumeId: number, format: string) {
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
    const body = marked.parse(resume.markdown_text);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:"Microsoft YaHei",sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.6}h1{font-size:28px;text-align:center}h2{font-size:20px;border-bottom:2px solid #333;padding-bottom:5px}h3{font-size:16px;margin-top:15px}ul{padding-left:20px}li{margin-bottom:5px}</style></head><body>${body}</body></html>`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
    await browser.close();
    const filePath = saveFile(Buffer.from(buffer), `resume_${resumeId}.pdf`, userId);
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
