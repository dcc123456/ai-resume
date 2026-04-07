// src/services/resumeService.ts
import { query } from '../db/connection';
import { parseFile } from '../utils/fileParser';
import { saveFile, getFilePath, computeTextHash } from './fileService';
import { getLLM } from '../llm';
import { buildResumeParsePrompt, SYSTEM_PROMPT } from '../prompts/resumeParse';
import { addResumeVector, findDuplicateResume } from './vectorService';

export async function uploadAndParseResume(file: Express.Multer.File, userId: number) {
  const text = await parseFile(file.buffer, file.mimetype);
  const llm = getLLM();
  const prompt = buildResumeParsePrompt(text);
  const { parsed: structuredJson } = await llm.chat(SYSTEM_PROMPT, prompt, { responseFormat: 'json' });
  const filePath = saveFile(file.buffer, file.originalname, userId);
  const duplicateId = await findDuplicateResume(userId, text);
  const warning = duplicateId ? '该简历内容与已上传的简历高度相似，是否覆盖？' : null;
  return { structured_json: structuredJson, raw_text: text, file_path: filePath, warning };
}

export async function saveBaseResume(userId: number, structuredJson: any, rawText: string, filePath: string) {
  const textHash = computeTextHash(rawText);
  const jsonStr = JSON.stringify(structuredJson);
  const existing = await query('SELECT id FROM base_resume WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    await query('UPDATE base_resume SET raw_text=?, structured_json=?, original_file_url=?, text_hash=? WHERE user_id=?', [rawText, jsonStr, filePath, textHash, userId]);
    await addResumeVector(userId, rawText, existing[0].id);
    return { success: true, resumeId: existing[0].id };
  } else {
    const result = await query('INSERT INTO base_resume (user_id, raw_text, structured_json, original_file_url, text_hash) VALUES (?,?,?,?,?)', [userId, rawText, jsonStr, filePath, textHash]);
    await addResumeVector(userId, rawText, (result as any).insertId);
    return { success: true, resumeId: (result as any).insertId };
  }
}

export async function getBaseResume(userId: number): Promise<any> {
  const rows = await query('SELECT * FROM base_resume WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

export async function downloadRawResume(userId: number): Promise<{ filePath: string | null }> {
  const resume = await getBaseResume(userId);
  if (!resume) return { filePath: null };
  return { filePath: getFilePath(resume.original_file_url) };
}
