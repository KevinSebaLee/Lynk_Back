import { supabaseClient } from "../database/supabase.js";

class EventRepository {
  static async createEvent(eventData: any, id_user: string | number) {
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
      const { data: insertResult, error: insertError } = await supabaseClient
        .from('Eventos')
        .insert({
          nombre,
          descripcion,
          fecha,
          ubicacion,
          visibilidad,
          presupuesto: parsedPresupuesto,
          objetivo: parsedObjetivo,
          color,
          id_creador: id_user,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      const id_evento = insertResult?.id;
      if (id_categoria) {
        try {
          const categoriesArray =
            typeof id_categoria === "string"
              ? JSON.parse(id_categoria)
              : id_categoria;
          if (Array.isArray(categoriesArray) && categoriesArray.length > 0) {
            for (let i = 0; i < categoriesArray.length; i++) {
              const { error: catError } = await supabaseClient
                .from('EventosCategoria')
                .insert({
                  id_evento,
                  id_categoria: categoriesArray[i]
                });
              
              if (catError) throw catError;
            }
          }
        } catch (error) {
          console.error("Error processing categories:", error);
        }
      }
      if (imagen) {
        const { error: updateError } = await supabaseClient
          .from('Eventos')
          .update({ imagen })
          .eq('id', id_evento);

        if (updateError) throw updateError;
      }
      return id_evento;
    } catch (error) {
      throw error;
    }
  }

  static async updateEvent(eventData: any) {
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
        const { error } = await supabaseClient
          .from('Eventos')
          .update({ imagen })
          .eq('id', id);

        if (error) throw error;
        console.log("Image update successful");
      } else {
        // Full update
        const { error } = await supabaseClient
          .from('Eventos')
          .update({
            nombre,
            descripcion,
            fecha,
            ubicacion,
            visibilidad,
            presupuesto: parsedPresupuesto,
            objetivo: parsedObjetivo,
            color,
            imagen
          })
          .eq('id', id);

        if (error) throw error;
        console.log("Full update successful");
      }

      // FALTAN INSERTAR CATEGORIAS

      return id;
    } catch (error) {
      throw error;
    }
  }

  static async deleteEvent(id: string | number) {
    try {
      const { error: deleteScheduledError } = await supabaseClient
        .from('EventosAgendados')
        .delete()
        .eq('id_evento', id);

      if (deleteScheduledError) throw deleteScheduledError;

      const { error: deleteCouponsError } = await supabaseClient
        .from('Cupones')
        .delete()
        .eq('id_evento', id);

      if (deleteCouponsError) throw deleteCouponsError;

      const { error: deleteEventError } = await supabaseClient
        .from('Eventos')
        .delete()
        .eq('id', id);

      if (deleteEventError) throw deleteEventError;

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAllEvents() {
    const { data, error } = await supabaseClient
      .from('Eventos')
      .select(`
        *,
        Usuarios!id_creador(nombre, apellido, pfp),
        EventosCategoria(
          Categorias!id_categoria(nombre)
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return data.map((event: any) => ({
      ...event,
      usuario_nombre: event.Usuarios?.nombre,
      usuario_apellido: event.Usuarios?.apellido,
      usuario_pfp: event.Usuarios?.pfp,
      categoria_nombre: event.EventosCategoria?.[0]?.Categorias?.nombre
    }));
  }

  static async getEventById(id: string | number) {
    const { data, error } = await supabaseClient
      .from('Eventos')
      .select(`
        id,
        nombre,
        descripcion,
        fecha,
        ubicacion,
        visibilidad,
        presupuesto,
        objetivo,
        color,
        imagen,
        id_creador,
        fecha_creacion,
        tags,
        Usuarios!id_creador(nombre, apellido, pfp),
        EventosCategoria(
          Categorias!id_categoria(nombre)
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) return null;

    return {
      ...data,
      usuario_nombre: (data.Usuarios as any)?.nombre,
      usuario_apellido: (data.Usuarios as any)?.apellido,
      usuario_pfp: (data.Usuarios as any)?.pfp,
      categoria_nombre: (data.EventosCategoria as any)?.[0]?.Categorias?.nombre
    };
  }

  static async checkEventAgendado(id_evento: string | number, id_user: string | number) {
    const { data, error } = await supabaseClient
      .from('EventosAgendados')
      .select('id_evento')
      .eq('id_evento', id_evento)
      .eq('id_user', id_user)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  }

  static async addEventToAgenda(id_evento: string | number, id_user: string | number, date: any) {
    const { error } = await supabaseClient
      .from('EventosAgendados')
      .insert({
        id_evento,
        id_user,
        date
      });

    if (error) throw error;
  }

  static async removeEventFromAgenda(id_evento: string | number, id_user: string | number) {
    const { error } = await supabaseClient
      .from('EventosAgendados')
      .delete()
      .eq('id_evento', id_evento)
      .eq('id_user', id_user);

    if (error) throw error;
  }

  static async getMonthlyInscriptions(eventId: string | number) {
    const { data, error } = await supabaseClient.rpc('get_monthly_inscriptions', { event_id: eventId });

    if (error) throw error;

    return data.map((row: any) => ({
      month: Number(row.month),
      inscriptions: Number(row.inscriptions)
    }));
  }

  static async getEventParticipants(eventId: string | number) {
    const { data, error } = await supabaseClient
      .from('EventosAgendados')
      .select(`
        Usuarios!id_user(email)
      `)
      .eq('id_evento', eventId);

    if (error) throw error;

    console.log('Fetched participants:', data);
    return data.map((r: any) => r.Usuarios?.email);
  }
}

export default EventRepository;
