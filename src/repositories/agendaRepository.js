import pool from '../database/pgClient.js';

export const getAgenda = async (id_user) => {
  const result = await pool.query(
    `SELECT e.id, e.nombre, e.descripcion, e.fecha, e.ubicacion, e.color, e.imagen
      FROM "EventosAgendados" ea
      JOIN "Eventos" e ON ea.id_evento = e.id
      WHERE ea.id_user = $1`,
    [id_user]
  );
  return result.rows;
};