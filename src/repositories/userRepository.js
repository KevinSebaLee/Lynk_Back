import pool from '../database/pgClient.js';

export const getUsers = async (id) => {
  const baseQuery = `
    SELECT u.*, p.nombre AS pais_nombre, g.nombre AS genero_nombre, pl.titulo AS plan_titulo
    FROM "Usuarios" u
    LEFT JOIN "Paises" p ON u.id_pais = p.id
    LEFT JOIN "Generos" g ON u.id_genero = g.id
    LEFT JOIN "Planes" pl ON u.id_premium = pl.id
    ${id ? 'WHERE u.id = $1' : ''}
  `;
  
  const result = id
    ? await pool.query(baseQuery, [id])
    : await pool.query(baseQuery);
  return result.rows.map(({ id_genero, id_pais, id_premium, ...rest }) => rest);
};