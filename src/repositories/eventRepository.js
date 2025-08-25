import pool from '../database/pgClient.js';

class EventRepository {
  static async createEvent(eventData, id_user) {
    const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen } = eventData;
    try {
      const insertResult = await pool.query(
        'INSERT INTO "Eventos" (nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, id_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
        [nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, id_user]
      );
      const id_evento = insertResult.rows[0]?.id;
      if (id_categoria) {
        try {
          const categoriesArray = typeof id_categoria === 'string'
            ? JSON.parse(id_categoria)
            : id_categoria;
          if (Array.isArray(categoriesArray) && categoriesArray.length > 0) {
            for (let i = 0; i < categoriesArray.length; i++) {
              await pool.query(
                'INSERT INTO "EventosCategoria" (id_evento, id_categoria) VALUES ($1, $2)',
                [id_evento, categoriesArray[i]]
              );
            }
          }
        } catch (error) {
          console.error('Error processing categories:', error);
        }
      }
      if (imagen) {
        await pool.query(
          'UPDATE "Eventos" SET imagen = $1 WHERE id = $2',
          [imagen, id_evento]
        );
      }
      return id_evento;

    } catch (error) {
      throw error
    }
  }

  static async updateEvent(eventData) {
    const { id, id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen } = eventData;
    try {
      const result = await pool.query(
        `UPDATE "Eventos" SET nombre = $1, descripcion = $2, fecha = $3, ubicacion = $4, visibilidad = $5, presupuesto = $6, objetivo = $7, color = $8, imagen = $9 WHERE id = $10`,
        [nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id]);

      // FALTAN INSERTAR CATEGORIAS

      return id
    } catch (error) {
      throw error
    }
  }

  static async getAllEvents() {
    const baseQuery = `
      SELECT e.*, 
        u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.pfp AS usuario_pfp,
        c.nombre AS categoria_nombre
      FROM "Eventos" e
      LEFT JOIN "Usuarios" u ON e.id_creador = u.id
      LEFT JOIN "EventosCategoria" ec ON e.id = ec.id_evento
      LEFT JOIN "Categorias" c ON ec.id_categoria = c.id
      ORDER BY e.fecha_creacion DESC`;
    const result = await pool.query(baseQuery);
    return result.rows;
  }

  static async getEventById(id) {
    const baseQuery = `
      SELECT e.*, 
        u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.pfp AS usuario_pfp,
        c.nombre AS categoria_nombre
      FROM "Eventos" e
      LEFT JOIN "Usuarios" u ON e.id_creador = u.id
      LEFT JOIN "EventosCategoria" ec ON e.id = ec.id_evento
      LEFT JOIN "Categorias" c ON ec.id_categoria = c.id
      WHERE e.id = $1
    `;
    const result = await pool.query(baseQuery, [id]);
    return result.rows[0];
  }

  static async checkEventAgendado(id_evento, id_user) {
    const lookup = await pool.query(
      'SELECT id_evento FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2 LIMIT 1',
      [id_evento, id_user]
    );
    return lookup.rows.length > 0;
  }

  static async addEventToAgenda(id_evento, id_user) {
    await pool.query(
      'INSERT INTO "EventosAgendados" (id_evento, id_user) VALUES ($1, $2)',
      [id_evento, id_user]
    );
  }

  static async removeEventFromAgenda(id_evento, id_user) {
    await pool.query(
      'DELETE FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2',
      [id_evento, id_user]
    );
  }
}

export default EventRepository;