import pool from '../database/pgClient.js';

class HomeRepository {
  static async getHomeData(id) {
    const userResult = await pool.query(`
      SELECT u.nombre AS user_nombre, u.tickets, p.titulo AS plan_titulo 
      FROM "Usuarios" u
      INNER JOIN "Planes" p ON u.id_premium = p.id
      WHERE u.id = $1
      LIMIT 1  
    `, [id]);

    const eventosRecientesResult = await pool.query(`
      SELECT *
      FROM "Eventos" e
      ORDER BY e.fecha_creacion
      LIMIT 5
    `);

    const eventosUsuario = await pool.query(`
      SELECT e.id, e.nombre, e.fecha, e.ubicacion, e.imagen
      FROM "Eventos" e
      WHERE e.id_creador = $1
      ORDER BY e.fecha DESC
    `, [id]);

    return {
      user: userResult.rows[0],
      eventosRecientes: eventosRecientesResult.rows,
      eventosUsuario: eventosUsuario.rows
    };
  }
}

export default HomeRepository;