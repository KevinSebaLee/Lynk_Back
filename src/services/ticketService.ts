import TicketRepository from '../repositories/ticketRepository.js';

export const getMovimientos = async (id) => TicketRepository.getMovimientos(id);
export const getCupones = async () => TicketRepository.getCupones();
export const getTransferUsers = async () => TicketRepository.getTransferUsers();
export const transferTickets = async (data) => TicketRepository.transferTickets(data);
export const getTicketsMonth = async (id) => TicketRepository.countTicketsLast6Months(id);
export const getCuponById = async (id) => TicketRepository.getCuponById(id);
export const getCuponesByEvent = async (id) => TicketRepository.getCuponesEvento(id);

export const createCupon = async (couponBody) => {
  if (!couponBody) {
    throw new Error('Missing required fields');
  }

  return TicketRepository.createCupon(couponBody);
};