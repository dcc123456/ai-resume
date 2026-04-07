// src/services/fileService.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config';

const uploadDir = path.resolve(__dirname, '..', '..', config.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export function saveFile(buffer: Buffer, originalName: string, userId: number): string {
  const ext = path.extname(originalName);
  const filename = `${userId}_${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function getFilePath(filename: string): string | null {
  const filePath = path.join(uploadDir, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

export function deleteFile(filePath: string): void {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function computeTextHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}
