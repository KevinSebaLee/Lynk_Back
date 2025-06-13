import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { id_user } = req.cookies || {};
    const result = await pool.query(
      'SELECT tickets, id_premium FROM "Usuarios" WHERE id = $1 LIMIT 1',
      [id_user]
    );

    res.json({ data: result.rows[0], id_user });
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;