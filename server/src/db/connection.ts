// src/db/connection.ts
import mysql from 'mysql2/promise';
import config from '../config';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

export async function query(sql: string, params?: any[]): Promise<any[]> {
  const [results] = await pool.execute(sql, params);
  return results as any[];
}

export async function getConnection() {
  return pool.getConnection();
}

export { pool };
