import AgendaRepository from '../repositories/agendaRepository.js';

export const getAgenda = async (id_user: string | number) => AgendaRepository.getAgenda(id_user);