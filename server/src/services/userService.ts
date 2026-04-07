// src/services/userService.ts
import bcrypt from 'bcryptjs';
import { query } from '../db/connection';

const SALT_ROUNDS = 10;

export async function createUser(email: string, password: string): Promise<{ userId: number; email: string }> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const result = await query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
    return { userId: (result as any).insertId, email };
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') throw new Error('该邮箱已注册');
    throw err;
  }
}

export async function findUserByEmail(email: string): Promise<any> {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function deleteUser(userId: number): Promise<{ success: boolean }> {
  const result = await query('DELETE FROM users WHERE id = ?', [userId]);
  return { success: (result as any).affectedRows > 0 };
}
