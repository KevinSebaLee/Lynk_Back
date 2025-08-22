import EventRepository from '../repositories/eventRepository.js';

export const getEvents = async () => {
  const rows = await EventRepository.getAllEvents();
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
  const event = await EventRepository.getEventById(id);
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

export const updateEvent = async (eventData) => {
  return await EventRepository.updateEvent(eventData);
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
    
    return await EventRepository.createEvent(eventData, id_user);
  } catch (error) {
    console.error('Error in createEvent service:', error);
    throw error;
  }
};

export const agendarEvent = async (id_evento, id_user) => {
  const alreadyAgendado = await EventRepository.checkEventAgendado(id_evento, id_user);
  if (alreadyAgendado) throw new Error('Event already registered');
  await EventRepository.addEventToAgenda(id_evento, id_user);
};

export const removeAgendadoEvent = async (id_evento, id_user) => {
  const alreadyAgendado = await EventRepository.checkEventAgendado(id_evento, id_user);
  if (!alreadyAgendado) throw new Error('Event not found in user agenda');
  await EventRepository.removeEventFromAgenda(id_evento, id_user);
};