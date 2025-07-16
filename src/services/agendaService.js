import * as agendaRepository from '../repositories/agendaRepository.js';

export const getAgenda = async (id_user) => agendaRepository.getAgenda(id_user);