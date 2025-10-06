import pool from "../database/pgClient.js";

class EventRepository {
  static async createEvent(eventData, id_user) {
    const {
      id_categoria,
      nombre,
      descripcion,
      fecha,
      ubicacion,
      visibilidad,
      presupuesto,
      objetivo,
      color,
      imagen,
    } = eventData;

    // Handle empty strings for numeric fields
    const parsedPresupuesto =
      presupuesto === "" ? null : parseFloat(presupuesto) || 0;
    const parsedObjetivo = objetivo === "" ? null : parseFloat(objetivo) || 0;

    try {
      const insertResult = await pool.query(
        'INSERT INTO "Eventos" (nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, id_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
        [
          nombre,
          descripcion,
          fecha,
          ubicacion,
          visibilidad,
          parsedPresupuesto,
          parsedObjetivo,
          color,
          id_user,
        ]
      );
      const id_evento = insertResult.rows[0]?.id;
      if (id_categoria) {
        try {
          const categoriesArray =
            typeof id_categoria === "string"
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
          console.error("Error processing categories:", error);
        }
      }
      if (imagen) {
        await pool.query('UPDATE "Eventos" SET imagen = $1 WHERE id = $2', [
          imagen,
          id_evento,
        ]);
      }
      return id_evento;
    } catch (error) {
      throw error;
    }
  }

  static async updateEvent(eventData) {
    const {
      id,
      id_categoria,
      nombre,
      descripcion,
      fecha,
      ubicacion,
      visibilidad,
      presupuesto,
      objetivo,
      color,
      imagen,
    } = eventData;

    console.log("UpdateEvent received data:", {
      id,
      imagen: imagen ? imagen.substring(0, 50) + "..." : "null",
      fields: Object.keys(eventData),
    });

    // Handle empty strings for numeric fields
    const parsedPresupuesto =
      presupuesto === "" ? null : parseFloat(presupuesto) || null;
    const parsedObjetivo =
      objetivo === "" ? null : parseFloat(objetivo) || null;

    try {
      // If we're only updating the image, use a simpler query
      if (
        Object.keys(eventData).length === 2 &&
        "id" in eventData &&
        "imagen" in eventData
      ) {
        console.log("Performing image-only update for event ID:", id);
        const result = await pool.query(
          `UPDATE "Eventos" SET imagen = $1 WHERE id = $2 RETURNING id`,
          [imagen, id]
        );
        console.log("Image update result:", result.rowCount, "rows affected");
      } else {
        // Full update
        const result = await pool.query(
          `UPDATE "Eventos" SET nombre = $1, descripcion = $2, fecha = $3, ubicacion = $4, visibilidad = $5, presupuesto = $6, objetivo = $7, color = $8, imagen = $9 WHERE id = $10 RETURNING id`,
          [
            nombre,
            descripcion,
            fecha,
            ubicacion,
            visibilidad,
            parsedPresupuesto,
            parsedObjetivo,
            color,
            imagen,
            id,
          ]
        );
        console.log("Full update result:", result.rowCount, "rows affected");
      }

      // FALTAN INSERTAR CATEGORIAS

      return id;
    } catch (error) {
      throw error;
    }
  }

  static async deleteEvent(id) {
    try {
      const deleteScheduledUsers = await pool.query(
        'DELETE FROM "EventosAgendados" WHERE id_evento = $1',
        [id]
      );
      const deleteResult = await pool.query(
        'DELETE FROM "Eventos" WHERE id = $1',
        [id]
      );
      if (deleteResult.rowCount === 0) {
        throw new Error("Event not found");
      }
      return true;
    } catch (error) {
      throw error;
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
      SELECT
      e.id,
      e.nombre,
      e.descripcion,
      e.fecha,
      e.ubicacion,
      e.visibilidad,
      e.presupuesto,
      e.objetivo,
      e.color,
      e.imagen,
      e.id_creador,
      e.fecha_creacion,              
      e.tags,
      u.nombre  AS usuario_nombre,
      u.apellido AS usuario_apellido,
      u.pfp     AS usuario_pfp,
      c.nombre  AS categoria_nombre
    FROM "Eventos" e
    LEFT JOIN "Usuarios" u ON e.id_creador = u.id
    LEFT JOIN "EventosCategoria" ec ON e.id = ec.id_evento
    LEFT JOIN "Categorias" c ON ec.id_categoria = c.id
    WHERE e.id = $1;
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

  static async addEventToAgenda(id_evento, id_user, date) {
    await pool.query(
      'INSERT INTO "EventosAgendados" (id_evento, id_user, date) VALUES ($1, $2, $3)',
      [id_evento, id_user, date]
    );
  }

  static async removeEventFromAgenda(id_evento, id_user) {
    await pool.query(
      'DELETE FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2',
      [id_evento, id_user]
    );
  }

  static async getMonthlyInscriptions(eventId) {
  const query = `
    SELECT EXTRACT(MONTH FROM date) AS month,
           COUNT(*) AS inscriptions
      FROM "EventosAgendados"
     WHERE id_evento = $1
     GROUP BY month
     ORDER BY month ASC
  `;
  const { rows } = await pool.query(query, [eventId]);
  return rows.map(row => ({
    month: Number(row.month),
    inscriptions: Number(row.inscriptions)
  }));
}

  static async getEventParticipants(eventId) {
    const result = await pool.query(
      'SELECT u.email FROM "EventosAgendados" ea JOIN "Usuarios" u ON ea.id_user = u.id WHERE ea.id_evento = $1',
      [eventId]
    );
    console.log('Fetched participants:', result.rows);
    return result.rows.map((r) => r.email);
  }
}

export default EventRepository;
