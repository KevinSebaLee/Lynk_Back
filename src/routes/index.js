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
      LEFT JOIN "EventosAgendados" ea ON ea.id_user = u.id
      LEFT JOIN "Eventos" e ON e.id = ea.id_evento
      WHERE u.id = $1
      LIMIT 1  
    `, [id]);

    const eventosRecientes = await pool.query(`
      SELECT *
      FROM "Eventos" e
      ORDER BY e.fecha_creacion
      LIMIT 10
    `);

    console.log(result)

    res.json({
      user: result.rows[0], 
      eventosRecientes: eventosRecientes.rows
    });
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;