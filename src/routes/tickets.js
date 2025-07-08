import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id } = req.user;

  console.log(id)

  try {
    const result = await pool.query(`
      SELECT m.*, u.tickets, e.nombre as evento_nombre, mo.nombre as moneda_nombre, c.nombre as categoria_nombre, tm.icon as tipo_movimiento_icon
      FROM "Movimientos" m
      LEFT JOIN "Usuarios" u ON m.id_user = u.id
      LEFT JOIN "Productos" p ON p.id = m.id_producto -- Assuming the correct foreign key is id_producto
      LEFT JOIN "Eventos" e ON p.id_evento = e.id
      LEFT JOIN "Monedas" mo ON m.id_moneda = mo.id
      LEFT JOIN "Categorias" c ON m.id_categoria = c.id
      LEFT JOIN "TipoMovimientos" tm ON m.id_tipo_movimiento = tm.id
      WHERE m.id_user = $1
    `, [id]);

    const cleanedData = result.rows.map(({ id_user: uid, id_evento, id_moneda, id_categoria, id_tipo_movimiento, id_producto, ...rest }) => rest);

    res.json(cleanedData);
  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/transacciones', requireAuth, async (req, res) => {
  const { id } = req.user;

  try {
    const result = await pool.query(`
      SELECT m.*, e.nombre as evento_nombre, mo.nombre as moneda_nombre, c.nombre as categoria_nombre, tm.icon as tipo_movimiento_icon
      FROM "Movimientos" m
      LEFT JOIN "Usuarios" u ON m.id_user = u.id AND u.id = 5
      LEFT JOIN "Productos" p ON p.id = m.id
      LEFT JOIN "Eventos" e ON p.id_evento = e.id
      LEFT JOIN "Monedas" mo ON m.id_moneda = mo.id
      LEFT JOIN "Categorias" c ON m.id_categoria = c.id
      LEFT JOIN "TipoMovimientos" tm ON m.id_tipo_movimiento = tm.id
      WHERE m.id_user = $1
    `, [id]);
  } catch (err) {

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

router.put('/transferir/', requireAuth, async(req, res) => {
  const {senderId, tickets, receiverId} = req.body
  
  try{
    const getReceiverUser = await pool.query(
      'SELECT tickets FROM "Usuarios" WHERE id = $1 LIMIT 1',
      [senderId]
    )

    const getSenderUser = await pool.query(
      'SELECT tickets FROM "Usuarios" WHERE id = $1 LIMIT 1',
      [receiverId]
    )
    
    if (getSenderUser.rows[0].tickets < tickets) {
      return res.status(400).json({ error: 'Insufficient tickets' });
    }

    const ticketsReceiverUser = getReceiverUser.rows[0].tickets + tickets

    const enviarTickets = await pool.query(
      'UPDATE "Usuarios" SET tickets = $1 WHERE id = $2',
      [ticketsReceiverUser, senderId]
    );

    console.log(getSenderUser.rows[0])

    const ticketsSenderUsers = getSenderUser.rows[0].tickets - tickets

    const restarTickets = await pool.query(
      'UPDATE "Usuarios" SET tickets = tickets - $1 WHERE id = $2',
      [ticketsSenderUsers, receiverId]
    )

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