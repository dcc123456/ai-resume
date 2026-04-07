// resume-ai/server/src/utils/fileParser.js
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const MIN_TEXT_LENGTH = 100;

async function parseFile(buffer, mimeType) {
  let text = '';
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    text = data.text;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error('不支持的文件类型，请上传 PDF 或 Word（.docx）文件');
  }
  const trimmed = text.trim();
  if (trimmed.length < MIN_TEXT_LENGTH) {
    throw new Error(`无法解析文件，提取的文本过短（${trimmed.length}字符，最少需要${MIN_TEXT_LENGTH}字符）。请上传文字可复制的 PDF 或 Word 文件。`);
  }
  return trimmed;
}

module.exports = { parseFile };
