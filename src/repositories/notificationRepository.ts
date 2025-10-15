import pool from '../database/pgClient.js';

class NotificationRepository {
  // Crear una notificación
  static async createNotification({ id_user, nombre, descripcion, leida = false, fecha_creacion = new Date() }: {
    id_user: string | number;
    nombre: string;
    descripcion: string;
    leida?: boolean;
    fecha_creacion?: Date;
  }) {
    const query = `
      INSERT INTO "Notificaciones" (id_user, nombre, descripcion, leida, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [id_user, nombre, descripcion, leida, fecha_creacion];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener todas las notificaciones de un usuario
  static async getNotificationsByUser(id_user: string | number) {
    const query = `
      SELECT * FROM "Notificaciones"
      WHERE id_user = $1
      ORDER BY fecha_creacion DESC;
    `;
    const result = await pool.query(query, [id_user]);
    return result.rows;
  }

  // Marcar una notificación como leída
  static async markNotificationAsRead(id: string | number) {
    const query = `
      UPDATE "Notificaciones"
      SET leida = TRUE
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deleteNotification(id: string | number) {
    const query = `
      DELETE FROM "Notificaciones"
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default NotificationRepository;