// src/utils/fileParser.ts
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const pdfParseFn = (pdfParse as any).default || pdfParse;
const MIN_TEXT_LENGTH = 100;

export async function parseFile(buffer: Buffer, mimeType: string, filename?: string): Promise<string> {
  console.log(`[文件解析] 开始解析文件: ${filename || 'unknown'}, MIME类型: ${mimeType}, 文件大小: ${buffer.length} bytes`);
  let text = '';
  
  if (mimeType === 'application/pdf') {
    console.log('[文件解析] 检测到 PDF 文件，开始使用 pdf-parse 解析...');
    try {
      const startTime = Date.now();
      const data = await pdfParseFn(buffer);
      const elapsed = Date.now() - startTime;
      console.log(`[文件解析] pdf-parse 解析完成，耗时: ${elapsed}ms, 提取文本长度: ${data.text?.length || 0}`);
      
      if (data.numpages) {
        console.log(`[文件解析] PDF 页数: ${data.numpages}`);
      }
      if (data.info) {
        console.log(`[文件解析] PDF 信息:`, JSON.stringify(data.info));
      }
      
      text = data.text || '';
      console.log(`[文件解析] 提取的原始文本 (前200字符): ${text.substring(0, 200).replace(/\n/g, '\\n')}...`);
    } catch (err: any) {
      console.error('[文件解析] pdf-parse 解析失败:', err.message, err.stack);
      throw new Error(`PDF 解析失败: ${err.message}`);
    }
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    console.log('[文件解析] 检测到 Word 文件 (.docx)，开始使用 mammoth 解析...');
    try {
      const startTime = Date.now();
      const result = await mammoth.extractRawText({ buffer });
      const elapsed = Date.now() - startTime;
      console.log(`[文件解析] mammoth 解析完成，耗时: ${elapsed}ms, 提取文本长度: ${result.value?.length || 0}`);
      
      if (result.messages && result.messages.length > 0) {
        console.log(`[文件解析] mammoth 警告消息:`, JSON.stringify(result.messages));
      }
      
      text = result.value || '';
      console.log(`[文件解析] 提取的原始文本 (前200字符): ${text.substring(0, 200).replace(/\n/g, '\\n')}...`);
    } catch (err: any) {
      console.error('[文件解析] mammoth 解析失败:', err.message, err.stack);
      throw new Error(`Word 文档解析失败: ${err.message}`);
    }
  } else {
    console.warn(`[文件解析] 不支持的文件类型: ${mimeType}`);
    throw new Error('不支持的文件类型，请上传 PDF 或 Word（.docx）文件');
  }
  
  const trimmed = text.trim();
  console.log(`[文件解析] 文本长度验证: 原始 ${text.length} 字符, 去除首尾空格后 ${trimmed.length} 字符`);
  
  if (trimmed.length < MIN_TEXT_LENGTH) {
    console.warn(`[文件解析] 文本过短，无法使用。实际: ${trimmed.length} 字符, 最少需要: ${MIN_TEXT_LENGTH} 字符`);
    throw new Error(`无法解析文件，提取的文本过短（${trimmed.length}字符，最少需要${MIN_TEXT_LENGTH}字符）。请上传文字可复制的 PDF 或 Word 文件。`);
  }
  
  console.log(`[文件解析] 文件解析成功，最终文本长度: ${trimmed.length} 字符`);
  return trimmed;
}
