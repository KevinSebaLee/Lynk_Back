import pool from '../database/pgClient.js';

class TicketRepository {
  static async getMovimientos(id) {
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
  }

  static async countTicketsLast6Months(id) {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', m.fecha_transaccion) AS month,
        -COALESCE(SUM(m.monto), 0) AS total_tickets
      FROM "Movimientos" m
      WHERE m.id_user = $1
        AND m.monto < 0
        AND m.fecha_transaccion >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        AND m.fecha_transaccion < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')
      GROUP BY month
      ORDER BY month ASC;
    `, [id]);

    return result.rows.map(row => ({
      month: row.month,
      total_tickets: row.total_tickets
    }));
  }

  static async getCupones() {
    const result = await pool.query('SELECT * FROM "Cupones"');
    return result.rows;
  }

  static async getCuponesEvento(id_evento){
    const result = await pool.query('SELECT * FROM "Cupones" WHERE id_evento = $1', [id_evento])
  }

  static async getCuponByEventAndId(id_evento, id_cupon) {
    const result = await pool.query(
      'SELECT * FROM "Cupones" WHERE id_evento = $1 AND id = $2',
      [id_evento, id_cupon]
    );
    return result.rows[0];
  }

  static async getTransferUsers() {
    const result = await pool.query('SELECT id, nombre, apellido, pfp FROM "Usuarios"');
    return result.rows;
  }

  static async transferTickets({ senderId, tickets, receiverId, date, userSenderName, userReceiverName }) {
    const sender = await pool.query('SELECT tickets FROM "Usuarios" WHERE id = $1', [senderId]);
    if (sender.rows[0].tickets < tickets) throw new Error('Insufficient tickets');

    await pool.query('UPDATE "Usuarios" SET tickets = tickets - $1 WHERE id = $2', [tickets, senderId]);
    await pool.query('UPDATE "Usuarios" SET tickets = tickets + $1 WHERE id = $2', [tickets, receiverId]);

    await pool.query(
      'INSERT INTO "Movimientos" id_producto, id_moneda, id_categoria, id_tipo_movimiento, monto, titulo, fecha_transaccion) VALUES ($1, null, 173, 2, 2, $2, $3, $4)',
      [senderId, -tickets, `Transfer to ${userReceiverName}`, date]
    );
    await pool.query(
      'INSERT INTO "Movimientos" id_producto, id_moneda, id_categoria, id_tipo_movimiento, monto, titulo, fecha_transaccion) VALUES ($1, null, 173, 2, 2, $2, $3, $4)',
      [receiverId, tickets, `Transfer from ${userSenderName}`, date]
    );
  }


  static async createCupon(couponBody) {
    console.log(couponBody);

    const { nombre, descripcion, vencimiento, condiciones, beneficios, min_compra, max_usos, evento_id } = couponBody;
    const result = await pool.query(
      'INSERT INTO "Cupones" (titulo, descripcion, vencimiento, condiciones, beneficios, precio, cantidad, id_evento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nombre, descripcion, vencimiento, condiciones, beneficios, min_compra, max_usos, evento_id],
    );

    const idCupon = result.rows[0].id

    const result1 = await pool.query(
      'INSERT INTO "CuponesXEventos" (id_evento, id_cupon) VALUES ($1, $2) RETURNING *',
      [evento_id, idCupon]
    )

    return result.rows[0];
  }
}

export default TicketRepository;