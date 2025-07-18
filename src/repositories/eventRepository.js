import pool from '../database/pgClient.js';
import fs from 'fs/promises';

export const getAllEvents = async () => {
  const baseQuery = `
    SELECT e.*, 
      u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.pfp AS usuario_pfp,
      c.nombre AS categoria_nombre
    FROM "Eventos" e
    LEFT JOIN "Usuarios" u ON e.id_creador = u.id
    LEFT JOIN "EventosCategoria" ec ON e.id = ec.id_evento
    LEFT JOIN "Categorias" c ON ec.id_categoria = c.id
    ORDER BY e.fecha_creacion DESC`;
  
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
    LEFT JOIN "EventosCategoria" ec ON e.id = ec.id_evento
    LEFT JOIN "Categorias" c ON ec.id_categoria = c.id
    WHERE e.id = $1
  `;
  const result = await pool.query(baseQuery, [id]);
  return result.rows[0];
};

export const createEvent = async (eventData, id_user) => {
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen } = eventData;

  let imagenVerificar = null;

  if(imagen){
    imagenVerificar = await fs.readFile(imagen);
  } else {
    throw new Error('Image is null');
  }

  await pool.query(
    'INSERT INTO "Eventos" (nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagenVerificar, id_user]
  );

  const id_evento_result = await pool.query('SELECT id FROM "Eventos" ORDER BY id DESC LIMIT 1');
  const id_evento = id_evento_result.rows[0]?.id;

  if (id_categoria != null) {
    if (!Array.isArray(id_categoria) || id_categoria.length === 0) {
      throw new Error('id_categoria must be an array with at least one element');
    }
    for (let i = 0; i < id_categoria.length; i++) {
      await pool.query(
        'INSERT INTO "EventosCategoria" (id_evento, id_categoria) VALUES ($1, $2)',
        [id_evento, id_categoria[i]]
      );
    }
  }
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