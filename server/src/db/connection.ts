// src/db/connection.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any = null;

async function initDb() {
  if (!db) {
    db = await open({
      filename: './resume_ai.db',
      driver: sqlite3.Database
    });
    // 导入 schema
    const fs = require('fs');
    const schema = fs.readFileSync('./src/db/schema.sql', 'utf8');
    await db.exec(schema);
  }
  return db;
}

export async function query(sql: string, params?: any[]): Promise<any[]> {
  const database = await initDb();
  const result = await database.all(sql, params);
  return result;
}

export async function getConnection() {
  return await initDb();
}

export { db };
