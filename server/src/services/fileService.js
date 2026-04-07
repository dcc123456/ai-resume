// resume-ai/server/src/services/fileService.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

const uploadDir = path.resolve(__dirname, '..', '..', config.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function saveFile(buffer, originalName, userId) {
  const ext = path.extname(originalName);
  const filename = `${userId}_${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

function getFilePath(filename) {
  const filePath = path.join(uploadDir, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

function deleteFile(filePath) {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function computeTextHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { saveFile, getFilePath, deleteFile, computeTextHash };
