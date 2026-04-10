// src/db/runMigration.ts
// 执行数据库迁移脚本
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'resume_ai',
    multipleStatements: true,
  };

  console.log('Connecting to database:', config.host, config.database, config.user);

  const connection = await mysql.createConnection(config);

  try {
    console.log('Connected to database, running migration...');

    const sqlPath = path.join(__dirname, 'migrate_profile.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    await connection.query(sql);
    console.log('Migration completed successfully!');
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
