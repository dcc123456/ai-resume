// resume-ai/server/src/services/jdService.js
const db = require('../db/connection');
const { parseFile } = require('../utils/fileParser');
const { getLLM } = require('../llm');
const { SYSTEM_PROMPT: JD_PARSE_SYSTEM, buildJDParsePrompt } = require('../prompts/jdParse');
const { computeKeywordMatchRate, getMissingKeywords } = require('./keywordService');
const { getBaseResume } = require('./resumeService');

const jdCache = new Map();
function getCacheKey(text) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(text).digest('hex');
}

async function parseJD(text, file = null) {
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

async function saveJD(userId, originalText, parsedJson) {
  const baseResume = await getBaseResume(userId);
  let matchRate = 0, missingKeywords = [];
  if (baseResume) {
    const resumeText = JSON.stringify(baseResume.structured_json);
    matchRate = computeKeywordMatchRate(resumeText, parsedJson.hard_skills);
    missingKeywords = getMissingKeywords(resumeText, parsedJson.hard_skills);
  }
  const result = await db.query('INSERT INTO job_description (user_id, original_text, parsed_json, keyword_match_rate) VALUES (?,?,?,?)', [userId, originalText, JSON.stringify(parsedJson), matchRate]);
  return { jd_id: result.insertId, keyword_match_rate: matchRate, missing_keywords: missingKeywords };
}

async function getJDList(userId, page = 1, size = 10) {
  const offset = (page - 1) * size;
  const items = await db.query('SELECT id, original_text, parsed_json, keyword_match_rate, created_at FROM job_description WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?', [userId, size, offset]);
  const [{ total }] = await db.query('SELECT COUNT(*) as total FROM job_description WHERE user_id=?', [userId]);
  return { items: items.map((i) => ({ id: i.id, title: i.parsed_json?.title || '未命名职位', created_at: i.created_at, match_rate: i.keyword_match_rate })), total };
}

async function deleteJD(userId, jdId) {
  const result = await db.query('DELETE FROM job_description WHERE id=? AND user_id=?', [jdId, userId]);
  return { success: result.affectedRows > 0 };
}

module.exports = { parseJD, saveJD, getJDList, deleteJD };
