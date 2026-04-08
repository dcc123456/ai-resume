// src/services/jdService.ts
import { query } from '../db/connection';
import { parseFile } from '../utils/fileParser';
import { getLLM } from '../llm';
import { SYSTEM_PROMPT as JD_PARSE_SYSTEM, buildJDParsePrompt } from '../prompts/jdParse';
import { computeKeywordMatchRate, getMissingKeywords } from './keywordService';
import { getBaseResume } from './resumeService';

const jdCache = new Map<string, any>();

function getCacheKey(text: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(text).digest('hex');
}

export async function parseJD(text: string, file?: Express.Multer.File): Promise<{ original_text: string; parsed_json: any }> {
  let jdText = text;
  if (file) jdText = await parseFile(file.buffer, file.mimetype);
  const cacheKey = getCacheKey(jdText);
  if (jdCache.has(cacheKey)) return jdCache.get(cacheKey);
  const llm = getLLM();
  const prompt = buildJDParsePrompt(jdText);
  const { parsed: parsedJson } = await llm.chat(JD_PARSE_SYSTEM, prompt, { responseFormat: 'json' });
  const result = { original_text: jdText, parsed_json: parsedJson };
  jdCache.set(cacheKey, result);
  return result;
}

export async function saveJD(userId: number, originalText: string, parsedJson: any) {
  const baseResume = await getBaseResume(userId);
  let matchRate = 0;
  let missingKeywords: string[] = [];
  if (baseResume) {
    const resumeText = JSON.stringify(baseResume.structured_json);
    matchRate = computeKeywordMatchRate(resumeText, parsedJson.hard_skills);
    missingKeywords = getMissingKeywords(resumeText, parsedJson.hard_skills);
  }
  const result = await query('INSERT INTO job_description (user_id, original_text, parsed_json, keyword_match_rate) VALUES (?,?,?,?)', [userId, originalText, JSON.stringify(parsedJson), matchRate]);
  return { jd_id: (result as any).insertId, keyword_match_rate: matchRate, missing_keywords: missingKeywords };
}

export async function getJDList(userId: number, page = 1, size = 10) {
  const offset = (page - 1) * size;
  const items = await query(`SELECT id, original_text, parsed_json, keyword_match_rate, created_at FROM job_description WHERE user_id=? ORDER BY created_at DESC LIMIT ${size} OFFSET ${offset}`, [userId]);
  const [{ total }] = await query('SELECT COUNT(*) as total FROM job_description WHERE user_id=?', [userId]);
  return { items: items.map((i: any) => ({ id: i.id, title: i.parsed_json?.title || '未命名职位', created_at: i.created_at, match_rate: i.keyword_match_rate })), total };
}

export async function deleteJD(userId: number, jdId: number) {
  const result = await query('DELETE FROM job_description WHERE id=? AND user_id=?', [jdId, userId]);
  return { success: (result as any).affectedRows > 0 };
}
