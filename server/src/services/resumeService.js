// resume-ai/server/src/services/resumeService.js
const db = require('../db/connection');
const { parseFile } = require('../utils/fileParser');
const { saveFile, getFilePath, computeTextHash } = require('./fileService');
const { getLLM } = require('../llm');
const { buildResumeParsePrompt, SYSTEM_PROMPT } = require('../prompts/resumeParse');
const { addResumeVector, findDuplicateResume } = require('./vectorService');

async function uploadAndParseResume(file, userId) {
  const text = await parseFile(file.buffer, file.mimetype);
  const llm = getLLM();
  const prompt = buildResumeParsePrompt(text);
  const { parsed: structuredJson } = await llm.chat(SYSTEM_PROMPT, prompt, { responseFormat: 'json' });
  const filePath = saveFile(file.buffer, file.originalname, userId);
  const duplicateId = await findDuplicateResume(userId, text);
  const warning = duplicateId ? '该简历内容与已上传的简历高度相似，是否覆盖？' : null;
  return { structured_json: structuredJson, raw_text: text, file_path: filePath, warning };
}

async function saveBaseResume(userId, structuredJson, rawText, filePath) {
  const textHash = computeTextHash(rawText);
  const jsonStr = JSON.stringify(structuredJson);
  const existing = await db.query('SELECT id FROM base_resume WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    await db.query('UPDATE base_resume SET raw_text=?, structured_json=?, original_file_url=?, text_hash=? WHERE user_id=?', [rawText, jsonStr, filePath, textHash, userId]);
    await addResumeVector(userId, rawText, existing[0].id);
    return { success: true, resumeId: existing[0].id };
  } else {
    const result = await db.query('INSERT INTO base_resume (user_id, raw_text, structured_json, original_file_url, text_hash) VALUES (?,?,?,?,?)', [userId, rawText, jsonStr, filePath, textHash]);
    await addResumeVector(userId, rawText, result.insertId);
    return { success: true, resumeId: result.insertId };
  }
}

async function getBaseResume(userId) {
  const rows = await db.query('SELECT * FROM base_resume WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function downloadRawResume(userId) {
  const resume = await getBaseResume(userId);
  if (!resume) return null;
  return { filePath: getFilePath(resume.original_file_url) };
}

module.exports = { uploadAndParseResume, saveBaseResume, getBaseResume, downloadRawResume };
