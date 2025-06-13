import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id_user } = req.cookies ? req.cookies : { id_user: null };

  if (!id_user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(`
      SELECT u.nombre, u.apellido, u.pfp, p.nombre AS pais_nombre, pl.titulo AS plan_titulo
      FROM "Usuarios" u
      LEFT JOIN "Paises" p ON u.id_pais = p.id
      LEFT JOIN "Planes" pl ON u.id_premium = pl.id
      WHERE u.id = $1
      LIMIT 1
    `, [id_user]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;