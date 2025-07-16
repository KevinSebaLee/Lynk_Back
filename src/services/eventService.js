import * as eventRepository from '../repositories/eventRepository.js';

export const getEvents = async () => {
  const rows = await eventRepository.getAllEvents();
  return rows.map(({ id_categoria, id_creador, presupuesto, objetivo, ...rest }) => ({
    ...rest,
    presupuesto: presupuesto?.toLocaleString(),
    objetivo: objetivo?.toLocaleString()
  }));
};

export const getEvent = async (id) => {
  const event = await eventRepository.getEventById(id);
  if (!event) return null;
  const { id_categoria, id_creador, presupuesto, objetivo, ...rest } = event;
  return {
    ...rest,
    presupuesto: presupuesto?.toLocaleString(),
    objetivo: objetivo?.toLocaleString()
  };
};

export const createEvent = async (eventData, id_user) => {
  await eventRepository.createEvent(eventData, id_user);
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