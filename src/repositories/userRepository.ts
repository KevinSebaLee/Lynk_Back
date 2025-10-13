import pool from '../database/pgClient.js';
import { supabaseClient } from '../database/supabase.js';

class UserRepository {
  static async getUsers() {
    // const { data, error } = await supabaseClient
    //   .from('Usuarios')
    //   .select('u.*, ')
    //   .

    const baseQuery = `
      SELECT u.*, p.nombre AS pais_nombre, g.nombre AS genero_nombre, pl.titulo AS plan_titulo
      FROM "Usuarios" u
      LEFT JOIN "Paises" p ON u.id_pais = p.id
      LEFT JOIN "Generos" g ON u.id_genero = g.id
      LEFT JOIN "Planes" pl ON u.id_premium = pl.id
    `;

    const result = await pool.query(baseQuery);
    return result.rows.map(({ id_genero, id_pais, id_premium, ...rest }) => rest);
  }
}

export default UserRepository;