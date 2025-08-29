import TicketRepository from '../repositories/ticketRepository.js';

export const getMovimientos = async (id) => TicketRepository.getMovimientos(id);
export const getCupones = async (id) => TicketRepository.getCupones(id);
export const getTransferUsers = async () => TicketRepository.getTransferUsers();
export const transferTickets = async (data) => TicketRepository.transferTickets(data);
export const getTicketsMonth = async (id) => TicketRepository.countTicketsMonth(id);