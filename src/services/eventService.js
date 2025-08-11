import * as eventRepository from '../repositories/eventRepository.js';

export const getEvents = async () => {
  const rows = await eventRepository.getAllEvents();
  return rows.map(({ id_categoria, id_creador, presupuesto, objetivo, ...rest }) => {
    let imagenBase64 = null;
    if (rest.imagen) {
      if (Buffer.isBuffer(rest.imagen)) {
        imagenBase64 = `data:image/jpeg;base64,${rest.imagen.toString('base64')}`;
      } 
    }
    
    return {
      ...rest,
      imagen: imagenBase64,
      presupuesto: presupuesto?.toLocaleString(),
      objetivo: objetivo?.toLocaleString()
    };
  });
};

export const getEvent = async (id) => {
  const event = await eventRepository.getEventById(id);
  if (!event) return null;
  
  const { id_categoria, id_creador, presupuesto, objetivo, ...rest } = event;
  
  let imagenBase64 = null;
  if (rest.imagen) {
    if (Buffer.isBuffer(rest.imagen)) {
      imagenBase64 = `data:image/jpeg;base64,${rest.imagen.toString('base64')}`;
    }
  }
  
  return {
    ...rest,
    imagen: imagenBase64,
    presupuesto: presupuesto?.toLocaleString(),
    objetivo: objetivo?.toLocaleString()
  };
};

export const createEvent = async (eventData, id_user) => {
  try {
    if (eventData.presupuesto && typeof eventData.presupuesto === 'string') {
      eventData.presupuesto = parseInt(eventData.presupuesto, 10) || 0;
    }
    
    if (eventData.objetivo && typeof eventData.objetivo === 'string') {
      eventData.objetivo = parseInt(eventData.objetivo, 10) || 0;
    }
    
    if (eventData.visibilidad === 'true' || eventData.visibilidad === '1') {
      eventData.visibilidad = 1;
    } else if (eventData.visibilidad === 'false' || eventData.visibilidad === '0') {
      eventData.visibilidad = 0;
    }
    
    return await eventRepository.createEvent(eventData, id_user);
  } catch (error) {
    console.error('Error in createEvent service:', error);
    throw error;
  }
};

export const agendarEvent = async (id_evento, id_user) => {
  const alreadyAgendado = await eventRepository.checkEventAgendado(id_evento, id_user);
  if (alreadyAgendado) throw new Error('Event already registered');
  await eventRepository.addEventToAgenda(id_evento, id_user);
};

export const removeAgendadoEvent = async (id_evento, id_user) => {
  const alreadyAgendado = await eventRepository.checkEventAgendado(id_evento, id_user);
  if (!alreadyAgendado) throw new Error('Event not found in user agenda');
  await eventRepository.removeEventFromAgenda(id_evento, id_user);
};