import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as eventService from '../services/eventService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const events = await eventService.getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    await eventService.createEvent(req.body);
    res.status(201).json({ message: 'Event created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.post('/:id/agendar', requireAuth, async (req, res) => {
  try {
    await eventService.agendarEvent(req.params.id, req.user.id);
    res.status(201).json({ message: 'Event scheduled successfully' });
  } catch (err) {
    res.status(err.message === 'Event already registered' ? 409 : 500).json({ error: err.message });
  }
});

router.delete('/:id/agendar', requireAuth, async (req, res) => {
  try {
    await eventService.removeAgendadoEvent(req.params.id, req.user.id);
    res.status(200).json({ message: 'Event removed from agenda successfully' });
  } catch (err) {
    res.status(err.message === 'Event not found in user agenda' ? 404 : 500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const event = await eventService.getEvent(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

export default router;