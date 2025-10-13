import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ticketService from '../services/ticketService.js';
import * as userService from '../services/userService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const movimientos = await ticketService.getMovimientos(id);
    const ticketsMonth = await ticketService.getTicketsMonth(id);

    const tickets = movimientos[0]?.tickets || 0;

    res.json({
      tickets,
      ticketsMonth,
      movimientos
    });
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/transacciones', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const transacciones = await ticketService.getMovimientos(id);
    res.json(transacciones);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/cupones', requireAuth, async (req, res) => {
  try {
    const cupones = await ticketService.getCupones();
    res.json(cupones);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

router.post('/cupones', requireAuth, async (req, res) => {
  const coupon = req.body

  try {
    const newCupon = await ticketService.createCupon(coupon);

    res.status(201).json(newCupon);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

router.get('/cupones/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const cupon = await ticketService.getCuponesByEvent(id);
    res.json(cupon);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch offer' });
  }
});

router.get('/cupones/:id_evento/:id_cupon', requireAuth, async (req, res) => {
  try {
    const { id_evento, id_cupon } = req.params;
    const cupon = await ticketService.getCuponById(id_evento, id_cupon);
    if (!cupon) {
      return res.status(404).json({ error: 'Coupon not found for this event' });
    }
    res.json(cupon);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch coupon for event' });
  }
});

router.get('/transferir', requireAuth, async (req, res) => {
  try {
    const users = await ticketService.getTransferUsers();
    res.json(users);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

router.post('/transferir', requireAuth, async (req, res) => {
  try {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); 
    const yyyy = date.getFullYear();

    const formattedDate = mm + '/' + dd + '/' + yyyy;

    const userReceiver = await userService.getUsers(req.body.receiverId)
    const userSender = await userService.getUsers(req.body.senderId)

    const dataToSend = { ...req.body, date: formattedDate, userSenderName: userSender[0].nombre, userReceiverName: userReceiver[0].nombre};

    await ticketService.transferTickets(dataToSend);
    res.json({ message: 'Tickets transferred successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to transfer tickets' });
  }
});

export default router;