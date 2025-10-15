import { supabaseClient } from '../database/supabase.js';

class HomeRepository {
  static async getHomeData(id: string | number) {
    const { data: userResult, error: userError } = await supabaseClient
      .from('Usuarios')
      .select(`
        nombre,
        tickets,
        Planes!id_premium(titulo)
      `)
      .eq('id', id)
      .limit(1)
      .single();

    if (userError) throw userError;

    const { data: eventosRecientes, error: eventosError } = await supabaseClient
      .from('Eventos')
      .select('*')
      .order('fecha_creacion', { ascending: true })
      .limit(5);

    if (eventosError) throw eventosError;

    const { data: eventosUsuario, error: eventosUsuarioError } = await supabaseClient
      .from('Eventos')
      .select('id, nombre, fecha, ubicacion, imagen')
      .eq('id_creador', id)
      .order('fecha', { ascending: false });

    if (eventosUsuarioError) throw eventosUsuarioError;

    return {
      user: {
        user_nombre: userResult.nombre,
        tickets: userResult.tickets,
        plan_titulo: (userResult.Planes as any)?.titulo
      },
      eventosRecientes,
      eventosUsuario
    };
  }
}

export default HomeRepository;