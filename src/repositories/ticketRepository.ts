import { supabaseClient } from '../database/supabase.js';

class TicketRepository {
  static async getMovimientos(id: string | number) {
    const { data, error } = await supabaseClient
      .from('Movimientos')
      .select(`
        *,
        Usuarios!id_user(tickets),
        Productos!id_producto(
          Eventos!id_evento(nombre)
        ),
        Monedas!id_moneda(nombre),
        Categorias!id_categoria(nombre),
        TipoMovimientos!id_tipo_movimiento(icon)
      `)
      .eq('id_user', id);

    if (error) throw error;

    return data.map(row => ({
      ...row,
      tickets: row.Usuarios?.tickets,
      evento_nombre: row.Productos?.Eventos?.nombre,
      moneda_nombre: row.Monedas?.nombre,
      categoria_nombre: row.Categorias?.nombre,
      tipo_movimiento_icon: row.TipoMovimientos?.icon
    }));
  }

  static async countTicketsLast6Months(id: string | number) {
    const { data, error } = await supabaseClient.rpc('count_tickets_last_6_months', { user_id: id });

    if (error) throw error;

    return data.map((row: any) => ({
      month: row.month,
      total_tickets: row.total_tickets
    }));
  }

  static async getCupones() {
    const { data, error } = await supabaseClient
      .from('Eventos')
      .select(`
        *,
        Cupones!id_evento(
          CuponesXEventos!id_cupon(*)
        )
      `)
      .not('Cupones', 'is', null);

    if (error) throw error;

    // Remove duplicates based on event id
    const uniqueEvents = data.reduce((acc: any[], current: any) => {
      if (!acc.find((item: any) => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueEvents;
  }

  static async getCuponesEvento(id_evento: string | number){
    console.log(id_evento)

    const { data, error } = await supabaseClient
      .from('Cupones')
      .select('*')
      .eq('id_evento', id_evento);

    if (error) throw error;

    return data;
  }

  static async getCuponByEventAndId(id_evento: string | number, id_cupon: string | number) {
    const { data, error } = await supabaseClient
      .from('Cupones')
      .select('*')
      .eq('id_evento', id_evento)
      .eq('id', id_cupon)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getTransferUsers() {
    const { data, error } = await supabaseClient
      .from('Usuarios')
      .select('id, nombre, apellido, pfp');

    if (error) throw error;
    return data;
  }

  static async transferTickets({ senderId, tickets, receiverId, date, userSenderName, userReceiverName }: {
    senderId: string | number;
    tickets: any[];
    receiverId: string | number;
    date: any;
    userSenderName: string;
    userReceiverName: string;
  }) {
    const { data: sender, error: senderError } = await supabaseClient
      .from('Usuarios')
      .select('tickets')
      .eq('id', senderId)
      .single();

    if (senderError) throw senderError;
    if (sender.tickets < tickets) throw new Error('Insufficient tickets');

    // Update sender tickets
    const { error: updateSenderError } = await supabaseClient
      .from('Usuarios')
      .update({ tickets: sender.tickets - Number(tickets) })
      .eq('id', senderId);

    if (updateSenderError) throw updateSenderError;

    // Update receiver tickets
    const { error: updateReceiverError } = await supabaseClient.rpc('increment_user_tickets', {
      user_id: receiverId,
      ticket_amount: tickets
    });

    if (updateReceiverError) throw updateReceiverError;

    // Insert sender movement
    const { error: insertSenderError } = await supabaseClient
      .from('Movimientos')
      .insert({
        id_user: senderId,
        id_producto: null,
        id_moneda: null,
        id_categoria: 173,
        id_tipo_movimiento: 2,
        monto: -Number(tickets),
        titulo: `Transfer to ${userReceiverName}`,
        fecha_transaccion: date
      });

    if (insertSenderError) throw insertSenderError;

    // Insert receiver movement
    const { error: insertReceiverError } = await supabaseClient
      .from('Movimientos')
      .insert({
        id_user: receiverId,
        id_producto: null,
        id_moneda: null,
        id_categoria: 173,
        id_tipo_movimiento: 2,
        monto: Number(tickets),
        titulo: `Transfer from ${userSenderName}`,
        fecha_transaccion: date
      });

    if (insertReceiverError) throw insertReceiverError;
  }


  static async createCupon(couponBody: any) {
    const { nombre, descripcion, vencimiento, condiciones, beneficios, min_compra, max_usos, evento_id, descuento } = couponBody;
    
    const { data, error } = await supabaseClient
      .from('Cupones')
      .insert({
        titulo: nombre,
        descripcion,
        vencimiento,
        condiciones,
        beneficios,
        precio: min_compra,
        cantidad: max_usos,
        id_evento: evento_id,
        descuento
      })
      .select()
      .single();

    if (error) throw error;

    const idCupon = data.id;

    const { error: insertError } = await supabaseClient
      .from('CuponesXEventos')
      .insert({
        id_evento: evento_id,
        id_cupon: idCupon
      });

    if (insertError) throw insertError;

    return data;
  }
}

export default TicketRepository;