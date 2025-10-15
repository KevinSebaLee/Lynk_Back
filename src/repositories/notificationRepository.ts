import { supabaseClient } from '../database/supabase.js';

class NotificationRepository {
  // Crear una notificación
  static async createNotification({ id_user, nombre, descripcion, leida = false, fecha_creacion = new Date() }: {
    id_user: string | number;
    nombre: string;
    descripcion: string;
    leida?: boolean;
    fecha_creacion?: Date;
  }) {
    const { data, error } = await supabaseClient
      .from('Notificaciones')
      .insert({
        id_user,
        nombre,
        descripcion,
        leida,
        fecha_creacion
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener todas las notificaciones de un usuario
  static async getNotificationsByUser(id_user: string | number) {
    const { data, error } = await supabaseClient
      .from('Notificaciones')
      .select('*')
      .eq('id_user', id_user)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Marcar una notificación como leída
  static async markNotificationAsRead(id: string | number) {
    const { data, error } = await supabaseClient
      .from('Notificaciones')
      .update({ leida: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteNotification(id: string | number) {
    const { data, error } = await supabaseClient
      .from('Notificaciones')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default NotificationRepository;