import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id } = req.user;

  const baseQuery = `
    SELECT e.*, 
      u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.pfp AS usuario_pfp,
      c.nombre AS categoria_nombre
    FROM "Eventos" e
    LEFT JOIN "Usuarios" u ON e.id_creador = u.id
    LEFT JOIN "Categorias" c ON e.id_categoria = c.id
    ${id_user ? 'WHERE e.id_creador = $1' : ''}
  `;

  try {
    const result = id_user
      ? await pool.query(baseQuery, [id_user])
      : await pool.query(baseQuery);

    const cleanedData = result.rows.map(({ id_categoria, id_creador, presupuesto, objetivo, ...rest }) => ({
      ...rest,
      presupuesto: presupuesto?.toLocaleString(),
      objetivo: objetivo?.toLocaleString()
    }));

    res.json(cleanedData);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Schedule event
router.get('/agendar', requireAuth, async (req, res) => {
  const { id_evento } = req.query;
  const { id_user } = req.cookies;

  if (!id_evento || !id_user) {
    return res.status(400).json({ error: 'Event ID and User ID are required' });
  }

  try {
    const lookup = await pool.query(
      'SELECT id_evento FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2 LIMIT 1',
      [id_evento, id_user]
    );
    if (lookup.rows[0]) {
      return res.status(409).json({ error: 'Event already registered' });
    }

    await pool.query(
      'INSERT INTO "EventosAgendados" (id_evento, id_user) VALUES ($1, $2)',
      [id_evento, id_user]
    );

    return res.status(201).json({ message: 'Event scheduled successfully' });

  } catch (err) {
    console.error('PostgreSQL Insert Error:', err);
    res.status(500).json({ error: 'Failed to insert event in agenda' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id_creador } = req.body;
  const imagenVerificar = imagen ?? null;

  try {
    await pool.query(
      'INSERT INTO "Eventos" (id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagenVerificar, id_creador]
    );
    return res.status(201).json({ message: 'Event created successfully' });
  } catch (err) {
    console.error('PostgreSQL Insert Error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;