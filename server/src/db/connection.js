// resume-ai/server/src/db/connection.js
const mysql = require('mysql2/promise');
const config = require('../config');

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

module.exports = {
  async query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
  },
  async getConnection() {
    return pool.getConnection();
  },
  pool,
};
