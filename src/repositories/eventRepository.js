import pool from '../database/pgClient.js';

export const createEvent = async (eventData, id_user) => {
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen } = eventData;

  try {
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert event without image first
      const insertResult = await client.query(
        'INSERT INTO "Eventos" (nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, id_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
        [nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, id_user]
      );
      
      const id_evento = insertResult.rows[0]?.id;
      
      // Now handle categories
      if (id_categoria) {
        try {
          // Parse the JSON string if it's a string
          const categoriesArray = typeof id_categoria === 'string' 
            ? JSON.parse(id_categoria) 
            : id_categoria;
          
          if (Array.isArray(categoriesArray) && categoriesArray.length > 0) {
            for (let i = 0; i < categoriesArray.length; i++) {
              await client.query(
                'INSERT INTO "EventosCategoria" (id_evento, id_categoria) VALUES ($1, $2)',
                [id_evento, categoriesArray[i]]
              );
            }
          }
        } catch (error) {
          console.error('Error processing categories:', error);
          // Continue execution even if categories fail
        }
      }
      
      // If we have an image, update the event record with the image
      if (imagen) {
        await client.query(
          'UPDATE "Eventos" SET imagen = $1 WHERE id = $2',
          [imagen, id_evento]
        );
      }
      
      await client.query('COMMIT');
      return id_evento;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error in createEvent:', error);
    throw error;
  }
};

// Keep the rest of the functions unchanged
export const getAllEvents = async () => {
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
};

export const getEventById = async (id) => {
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
};

export const checkEventAgendado = async (id_evento, id_user) => {
  const lookup = await pool.query(
    'SELECT id_evento FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2 LIMIT 1',
    [id_evento, id_user]
  );
  return lookup.rows.length > 0;
};

export const addEventToAgenda = async (id_evento, id_user) => {
  await pool.query(
    'INSERT INTO "EventosAgendados" (id_evento, id_user) VALUES ($1, $2)',
    [id_evento, id_user]
  );
};

export const removeEventFromAgenda = async (id_evento, id_user) => {
  await pool.query(
    'DELETE FROM "EventosAgendados" WHERE id_evento = $1 AND id_user = $2',
    [id_evento, id_user]
  );
};