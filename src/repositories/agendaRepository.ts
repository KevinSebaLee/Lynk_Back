import pool from '../database/pgClient.js';

class AgendaRepository {
  static async getAgenda(id_user: string | number) {
    const result = await pool.query(
      `SELECT e.id, e.nombre, e.descripcion, e.fecha, e.ubicacion, e.color, e.imagen
        FROM "EventosAgendados" ea
        JOIN "Eventos" e ON ea.id_evento = e.id
        WHERE ea.id_user = $1`,
      [id_user]
    );
    return result.rows;
  }
}

export default AgendaRepository;