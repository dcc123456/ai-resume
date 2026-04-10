// src/services/profileService.ts
// 用户资料服务

import { query } from '../db/connection';

export interface UserProfile {
  name: string | null;
  avatar_base64: string | null;
  email: string;
}

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const rows = await query(
    'SELECT name, avatar_base64, email FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) return null;
  const row = rows[0] as any;
  return {
    name: row.name || null,
    avatar_base64: row.avatar_base64 || null,
    email: row.email,
  };
}

export interface UpdateProfileData {
  name?: string;
  avatar_base64?: string;
}

export async function updateUserProfile(userId: number, data: UpdateProfileData): Promise<boolean> {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name || null);
  }

  if (data.avatar_base64 !== undefined) {
    updates.push('avatar_base64 = ?');
    params.push(data.avatar_base64 || null);
  }

  if (updates.length === 0) return false;

  params.push(userId);

  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return (result as any).affectedRows > 0;
}
