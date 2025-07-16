import * as ticketRepository from '../repositories/ticketRepository.js';

export const getMovimientos = async (id) => ticketRepository.getMovimientos(id);
export const getTransacciones = async (id) => ticketRepository.getTransacciones(id);
export const getCupones = async (id) => ticketRepository.getCupones(id);
export const getTransferUsers = async () => ticketRepository.getTransferUsers();
export const transferTickets = async (data) => ticketRepository.transferTickets(data);