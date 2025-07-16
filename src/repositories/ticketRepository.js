import pool from '../database/pgClient.js';

export const getMovimientos = async (id) => {
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
  return result.rows;
};

export const getTransacciones = async (id) => {
  const result = await pool.query(`
    SELECT m.*
    FROM "Usuarios" u
    JOIN "Movimientos" m ON u.id = m.id_user
    WHERE m.id_user = $1
    LIMIT 5
  `, [id]);
  return result.rows;
};

export const getCupones = async (id) => {
  const result = await pool.query('SELECT * FROM "Cupones" WHERE id_user = $1', [id]);
  return result.rows;
};

export const getTransferUsers = async () => {
  const result = await pool.query('SELECT id, nombre, apellido, pfp FROM "Usuarios"');
  return result.rows;
};

export const transferTickets = async ({ senderId, tickets, receiverId }) => {
  const sender = await pool.query('SELECT tickets FROM "Usuarios" WHERE id = $1', [senderId]);
  if (sender.rows[0].tickets < tickets) throw new Error('Insufficient tickets');

  await pool.query('UPDATE "Usuarios" SET tickets = tickets - $1 WHERE id = $2', [tickets, senderId]);
  await pool.query('UPDATE "Usuarios" SET tickets = tickets + $1 WHERE id = $2', [tickets, receiverId]);

  await pool.query(
    'INSERT INTO "Movimientos" (id_user, id_producto, id_moneda, id_categoria, id_tipo_movimiento, monto, titulo) VALUES ($1, null, 173, 2, 2, $2, $3)',
    [senderId, tickets, `Transfer to ${receiverId}`]
  );
  await pool.query(
    'INSERT INTO "Movimientos" (id_user, id_producto, id_moneda, id_categoria, id_tipo_movimiento, monto, titulo) VALUES ($1, null, 173, 2, 2, $2, $3)',
    [receiverId, -tickets, `Transfer from ${senderId}`]
  );
};