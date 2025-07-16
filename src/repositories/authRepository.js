import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM "Usuarios" WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0];
};

export const comparePassword = async (plain, hash) => {
  return bcrypt.compare(String(plain), hash);
};