import pool from '../database/pgClient.js';

class ProfileRepository {
  static async getProfile(id: string | number) {
    const result = await pool.query(`
      SELECT u.nombre, u.apellido, u.pfp, p.nombre AS pais_nombre, pl.titulo AS plan_titulo
      FROM "Usuarios" u
      LEFT JOIN "Paises" p ON u.id_pais = p.id
      LEFT JOIN "Planes" pl ON u.id_premium = pl.id
      WHERE u.id = $1
      LIMIT 1
    `, [id]);
    return result.rows[0];
  }
}

export default ProfileRepository;