import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id_user } = req.cookies

  try {
    const result = await pool.query(`
      SELECT m.*, u.tickets, e.nombre as evento_nombre, mo.nombre as moneda_nombre, c.nombre as categoria_nombre, tm.icon as tipo_movimiento_icon
      FROM "Movimientos" m
      LEFT JOIN "Usuarios" u ON m.id_user = u.id
      LEFT JOIN "Productos" p ON p.id = m.id
      LEFT JOIN "Eventos" e ON p.id_evento = e.id
      LEFT JOIN "Monedas" mo ON m.id_moneda = mo.id
      LEFT JOIN "Categorias" c ON m.id_categoria = c.id
      LEFT JOIN "TipoMovimientos" tm ON m.id_tipo_movimiento = tm.id
      WHERE m.id_user = $1
    `, [id_user]);

    const cleanedData = result.rows.map(({ id, id_user: uid, id_evento, id_moneda, id_categoria, id_tipo_movimiento, ...rest }) => rest);

    res.json(cleanedData);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/cupones', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Cupones" WHERE id_user = $1',
      [req.id_user]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

export default router;