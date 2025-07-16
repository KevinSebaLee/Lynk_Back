import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ticketService from '../services/ticketService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const movimientos = await ticketService.getMovimientos(id);
    res.json(movimientos);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/transacciones', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const transacciones = await ticketService.getTransacciones(id);
    res.json(transacciones);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/cupones', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const cupones = await ticketService.getCupones(id);
    res.json(cupones);
  } catch (err) {
    console.error('Tickets Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
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
    await ticketService.transferTickets(req.body);
    res.json({ message: 'Tickets transferred successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to transfer tickets' });
  }
});

export default router;