import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id } = req.user;

  try {
    const result = await pool.query(`
      SELECT m.*, u.tickets as tickets, e.nombre as evento_nombre, mo.nombre as moneda_nombre, c.nombre as categoria_nombre, tm.icon as tipo_movimiento_icon
      FROM "Movimientos" m
      LEFT JOIN "Usuarios" u ON m.id_user = u.id
      LEFT JOIN "Productos" p ON p.id = m.id_producto
      LEFT JOIN "Eventos" e ON p.id_evento = e.id
      LEFT JOIN "Monedas" mo ON m.id_moneda = mo.id
      LEFT JOIN "Categorias" c ON m.id_categoria = c.id
      LEFT JOIN "TipoMovimientos" tm ON m.id_tipo_movimiento = tm.id
      WHERE m.id_user = $1
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/transacciones', requireAuth, async (req, res) => {
  const { id } = req.user;

  try {
    const result = await pool.query(`
      SELECT m.*
      FROM "Usuarios" u
      JOIN "Movimientos" m ON u.id = m.id_user
      WHERE m.id_user = $1
      LIMIT 5
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
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

router.get('/transferir', requireAuth, async(req, res) => {
  try{
    const result = await pool.query(
      'SELECT nombre, apellido, pfp FROM "Usuarios"'
    );

    res.json(result.rows);
  }catch(err){
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
})

router.post('/transferir/', requireAuth, async(req, res) => {
  const {senderId, tickets, receiverId} = req.body
  
  try{
    const getReceiverUser = await pool.query(
      'SELECT nombre, tickets FROM "Usuarios" WHERE id = $1 LIMIT 1',
      [receiverId]
    )

    const getSenderUser = await pool.query(
      'SELECT nombre, tickets FROM "Usuarios" WHERE id = $1 LIMIT 1',
      [senderId]
    )

    const userReceiver = getReceiverUser.rows[0];
    const userSender = getSenderUser.rows[0];
    
    if (getSenderUser.rows[0].tickets < tickets) {
      console.error('Insufficient tickets for transfer' + getSenderUser.rows[0].tickets);
      return res.status(400).json({ error: 'Insufficient tickets' });
    }

    const ticketsReceiverUser = userReceiver.tickets + tickets
    const ticketsSenderUsers = userSender.tickets - tickets

    const enviarTickets = await pool.query(
      'UPDATE "Usuarios" SET tickets = $1 WHERE id = $2',
      [ticketsSenderUsers, senderId]
    );

    const restarTickets = await pool.query(
      'UPDATE "Usuarios" SET tickets = $1 WHERE id = $2',
      [ticketsReceiverUser, receiverId]
    )

    console.log('Tickets updated successfully', userReceiver.nombre, userSender.nombre);

    const guardarMovimientoSender = await pool.query(
      'INSERT INTO "Movimientos" (id_user, id_producto, id_moneda, id_categoria, id_tipo_movimiento, monto, titulo) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [senderId, null, 173, 2, 2, tickets, userReceiver.nombre]
    );

    const guardarMovimientoReceiver = await pool.query(
      'INSERT INTO "Movimientos" (id_user, id_producto, id_moneda, id_categoria, id_tipo_movimiento, monto, titulo) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [receiverId, null, 173, 2, 2, -(tickets), userSender.nombre]
    );

    res.json({
      message: 'TIckets transfered successfully',
      senderNewBalance: enviarTickets.rows[0],
      receiverNewBalance: restarTickets.rows[0]
    });

  }catch(err){
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
})

export default router;