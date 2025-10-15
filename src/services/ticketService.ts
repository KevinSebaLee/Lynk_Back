import TicketRepository from '../repositories/ticketRepository.js';

export const getMovimientos = async (id: string | number) => TicketRepository.getMovimientos(id);
export const getCupones = async () => TicketRepository.getCupones();
export const getTransferUsers = async () => TicketRepository.getTransferUsers();
export const transferTickets = async (data: any) => TicketRepository.transferTickets(data);
export const getTicketsMonth = async (id: string | number) => TicketRepository.countTicketsLast6Months(id);
export const getCuponById = async (id_evento: string | number, id: string | number) => TicketRepository.getCuponByEventAndId(id_evento, id);
export const getCuponesByEvent = async (id: string | number) => TicketRepository.getCuponesEvento(id);

export const createCupon = async (couponBody: any) => {
  if (!couponBody) {
    throw new Error('Missing required fields');
  }

  return TicketRepository.createCupon(couponBody);
};