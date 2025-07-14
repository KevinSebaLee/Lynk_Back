import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id } = req.user;

  try {
    const result = await pool.query(
      `SELECT e.id, e.nombre, e.descripcion, e.fecha, e.ubicacion, e.color, e.imagen
        FROM "EventosAgendados" ea
        JOIN "Eventos" e ON ea.id_evento = e.id
        WHERE ea.id_user = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch agenda' });
  }
});

export default router;