import AgendaRepository from '../repositories/agendaRepository.js';

export const getAgenda = async (id_user) => AgendaRepository.getAgenda(id_user);