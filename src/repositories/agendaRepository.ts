import { supabaseClient } from '../database/supabase.js';

class AgendaRepository {
  static async getAgenda(id_user: string | number) {
    const { data, error } = await supabaseClient
      .from('EventosAgendados')
      .select(`
        Eventos!id_evento(id, nombre, descripcion, fecha, ubicacion, color, imagen)
      `)
      .eq('id_user', id_user);

    if (error) throw error;

    return data.map((item: any) => item.Eventos);
  }
}

export default AgendaRepository;