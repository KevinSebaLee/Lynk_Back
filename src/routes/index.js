import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;

    const result = await pool.query(`
      SELECT u.nombre AS user_nombre, u.tickets, p.titulo AS plan_titulo, e.nombre AS event_nombre, e.descripcion AS event_descripcion, e.imagen AS event_imagen
      FROM "Usuarios" u
      INNER JOIN "Planes" p ON u.id_premium = p.id
      INNER JOIN "EventosAgendados" ea ON ea.id_user = u.id
      INNER JOIN "Eventos" e ON e.id = ea.id_evento
      WHERE u.id = $1
      LIMIT 1
    `, [id]);

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;