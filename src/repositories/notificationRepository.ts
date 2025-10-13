class NotificationRepository {
    constructor(db) {
      this.db = db;
    }
  
    // Crear una notificación
    async createNotification({ id_user, nombre, descripcion, leida = false, fecha_creacion = new Date() }) {
      const query = `
        INSERT INTO "Notificaciones" (id_user, nombre, descripcion, leida, fecha_creacion)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [id_user, nombre, descripcion, leida, fecha_creacion];
      const result = await this.db.query(query, values);
      return result.rows[0];
    }
  
    // Obtener todas las notificaciones de un usuario
    async getNotificationsByUser(id_user) {
      const query = `
        SELECT * FROM "Notificaciones"
        WHERE id_user = $1
        ORDER BY fecha_creacion DESC;
      `;
      const result = await this.db.query(query, [id_user]);
      return result.rows;
    }
  
    // Marcar una notificación como leída
    async markNotificationAsRead(id) {
      const query = `
        UPDATE "Notificaciones"
        SET leida = TRUE
        WHERE id = $1
        RETURNING *;
      `;
      const result = await this.db.query(query, [id]);
      return result.rows[0];
    }

    async deleteNotification(id) {
        const query = `
          DELETE FROM "Notificaciones"
          WHERE id = $1
          RETURNING *;
        `;
        const result = await this.db.query(query, [id]);
        return result.rows[0];
      }
  }
  
  export default NotificationRepository;