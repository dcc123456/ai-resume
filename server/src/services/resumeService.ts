// src/services/resumeService.ts
import { query } from '../db/connection';
import { parseFile } from '../utils/fileParser';
import { saveFile, getFilePath, computeTextHash } from './fileService';
import { getLLM } from '../llm';
import { buildResumeParsePrompt, SYSTEM_PROMPT } from '../prompts/resumeParse';
import { addResumeVector, findDuplicateResume } from './vectorService';
import { extractImagesFromPdf, selectAvatarImage } from '../utils/pdfImageExtractor';

export async function uploadAndParseResume(file: Express.Multer.File, userId: number) {
  console.log(`[简历服务] ========== 开始处理简历上传 ==========`);
  console.log(`[简历服务] 用户ID: ${userId}`);
  console.log(`[简历服务] 文件名: ${file.originalname}`);
  console.log(`[简历服务] 文件大小: ${file.size} bytes`);
  console.log(`[简历服务] MIME类型: ${file.mimetype}`);
  
  console.log(`[简历服务] 步骤1: 解析文件文本...`);
  const text = await parseFile(file.buffer, file.mimetype, file.originalname);
  console.log(`[简历服务] 步骤1完成: 提取文本长度 ${text.length} 字符`);

  // 提取头像（仅 PDF 文件）
  let photoBase64: string | null = null;
  if (file.mimetype === 'application/pdf') {
    console.log(`[简历服务] 步骤1.5: 从 PDF 提取头像图片...`);
    try {
      const images = await extractImagesFromPdf(file.buffer);
      photoBase64 = selectAvatarImage(images);
      if (photoBase64) {
        console.log(`[简历服务] 头像提取成功，长度: ${photoBase64.length} 字符`);
      } else {
        console.log(`[简历服务] 未检测到头像图片`);
      }
    } catch (err: any) {
      console.warn('[简历服务] 头像提取失败:', err.message);
    }
  }

  console.log(`[简历服务] 步骤2: 调用 LLM 解析结构化数据...`);
  const llm = getLLM();
  const prompt = buildResumeParsePrompt(text);
  console.log(`[简历服务] LLM Prompt 长度: ${prompt.length} 字符`);
  
  const startTime = Date.now();
  const { parsed: structuredJson } = await llm.chat(SYSTEM_PROMPT, prompt, { responseFormat: 'json' });
  const llmElapsed = Date.now() - startTime;
  console.log(`[简历服务] 步骤2完成: LLM 解析耗时 ${llmElapsed}ms`);
  console.log(`[简历服务] 解析结果:`, JSON.stringify(structuredJson, null, 2));
  
  console.log(`[简历服务] 步骤3: 保存文件到磁盘...`);
  const filePath = saveFile(file.buffer, file.originalname, userId);
  console.log(`[简历服务] 文件保存路径: ${filePath}`);
  
  console.log(`[简历服务] 步骤4: 检查重复简历...`);
  let warning: string | null = null;
  try {
    const duplicateStart = Date.now();
    const duplicateId = await findDuplicateResume(userId, text);
    const dupElapsed = Date.now() - duplicateStart;
    console.log(`[简历服务] 重复检查耗时: ${dupElapsed}ms, 结果: ${duplicateId ? '发现重复' : '无重复'}`);
    warning = duplicateId ? '该简历内容与已上传的简历高度相似，是否覆盖？' : null;
  } catch (err: any) {
    console.warn('[简历服务] 向量查重跳过:', err.message);
  }

  // 自动保存到数据库
  try {
    // 将头像注入 structuredJson
    if (photoBase64) {
      structuredJson.photo_base64 = photoBase64;
    }
    await saveBaseResume(userId, structuredJson, text, filePath, photoBase64);
    console.log(`[简历服务] 简历已自动保存到数据库`);
  } catch (err: any) {
    console.warn('[简历服务] 自动保存失败:', err.message);
  }

  console.log(`[简历服务] ========== 简历上传处理完成 ==========`);
  return { structured_json: structuredJson, raw_text: text, file_path: filePath, warning };
}

export async function saveBaseResume(userId: number, structuredJson: any, rawText: string, filePath: string, photoBase64: string | null = null) {
  const textHash = computeTextHash(rawText);
  const jsonStr = JSON.stringify(structuredJson);
  const existing = await query('SELECT id FROM base_resume WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    await query('UPDATE base_resume SET raw_text=?, structured_json=?, original_file_url=?, text_hash=?, photo_base64=? WHERE user_id=?', [rawText, jsonStr, filePath, textHash, photoBase64, userId]);
    await addResumeVector(userId, rawText, existing[0].id);
    return { success: true, resumeId: existing[0].id };
  } else {
    const result = await query('INSERT INTO base_resume (user_id, raw_text, structured_json, original_file_url, text_hash, photo_base64) VALUES (?,?,?,?,?,?)', [userId, rawText, jsonStr, filePath, textHash, photoBase64]);
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
