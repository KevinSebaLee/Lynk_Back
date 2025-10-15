import { supabaseClient } from '../database/supabase.js';

class UserRepository {
  static async getUsers() {
    const { data, error } = await supabaseClient
      .from('Usuarios')
      .select(`
        *,
        Paises!id_pais(nombre),
        Generos!id_genero(nombre),
        Planes!id_premium(titulo)
      `);

    if (error) throw error;

    return data.map(({ id_genero, id_pais, id_premium, Paises, Generos, Planes, ...rest }) => ({
      ...rest,
      pais_nombre: Paises?.nombre,
      genero_nombre: Generos?.nombre,
      plan_titulo: Planes?.titulo
    }));
  }
}

export default UserRepository;