import pool from '../database/pgClient.js';

export const getAllEvents = async () => {
  const baseQuery = `
    SELECT e.*, 
      u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.pfp AS usuario_pfp,
      c.nombre AS categoria_nombre
    FROM "Eventos" e
    LEFT JOIN "Usuarios" u ON e.id_creador = u.id
    LEFT JOIN "Categorias" c ON e.id_categoria = c.id
  `;
  const result = await pool.query(baseQuery);
  return result.rows;
};

export const getEventById = async (id) => {
  const baseQuery = `
    SELECT e.*, 
      u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.pfp AS usuario_pfp,
      c.nombre AS categoria_nombre
    FROM "Eventos" e
    LEFT JOIN "Usuarios" u ON e.id_creador = u.id
    LEFT JOIN "Categorias" c ON e.id_categoria = c.id
    WHERE e.id = $1
  `;
  const result = await pool.query(baseQuery, [id]);
  return result.rows[0];
};

export const createEvent = async (eventData) => {
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id_creador } = eventData;
  const imagenVerificar = imagen ?? null;

  await pool.query(
    'INSERT INTO "Eventos" (id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagenVerificar, id_creador]
  );
};

export const checkEventAgendado = async (id_evento, id_user) => {
  const lookup = await pool.query(
    'SELECT id_evento FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2 LIMIT 1',
    [id_evento, id_user]
  );
  return lookup.rows.length > 0;
};

export const addEventToAgenda = async (id_evento, id_user) => {
  await pool.query(
    'INSERT INTO "EventosAgendados" (id_evento, id_user) VALUES ($1, $2)',
    [id_evento, id_user]
  );
};

export const removeEventFromAgenda = async (id_evento, id_user) => {
  await pool.query(
    'DELETE FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2',
    [id_evento, id_user]
  );
};