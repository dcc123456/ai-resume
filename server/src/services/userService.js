// resume-ai/server/src/services/userService.js
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

const SALT_ROUNDS = 10;

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const result = await db.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
    return { userId: result.insertId, email };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new Error('该邮箱已注册');
    throw err;
  }
}

async function findUserByEmail(email) {
  const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function deleteUser(userId) {
  const result = await db.query('DELETE FROM users WHERE id = ?', [userId]);
  return { success: result.affectedRows > 0 };
}

module.exports = { createUser, findUserByEmail, deleteUser };
