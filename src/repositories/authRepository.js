import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';

class AuthRepository {
  static async findUserByEmail(email) {
    const result = await pool.query('SELECT * FROM "Usuarios" WHERE email = $1 LIMIT 1', [email]);
    return result.rows[0];
  }

  static async comparePassword(plain, hash) {
    return bcrypt.compare(String(plain), hash);
  }
}

export default AuthRepository;