import { supabaseClient } from '../database/supabase.js';

class ProfileRepository {
  static async getProfile(id: string | number) {
    const { data, error } = await supabaseClient
      .from('Usuarios')
      .select(`
        nombre,
        apellido,
        pfp,
        Paises!id_pais(nombre),
        Planes!id_premium(titulo)
      `)
      .eq('id', id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) return null;

    return {
      nombre: data.nombre,
      apellido: data.apellido,
      pfp: data.pfp,
      pais_nombre: (data.Paises as any)?.nombre,
      plan_titulo: (data.Planes as any)?.titulo
    };
  }
}

export default ProfileRepository;