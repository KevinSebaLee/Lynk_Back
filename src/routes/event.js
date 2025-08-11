import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as eventService from '../services/eventService.js';
import multer from 'multer';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const events = await eventService.getEvents();
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', requireAuth, upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.user;
    
    console.log('Creating event with data:', {
      body: req.body,
      file: req.file ? {
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname
      } : 'No file uploaded'
    });
    
    const eventData = {
      ...req.body,
      imagen: req.file ? req.file.buffer : null,
    };
    
    const eventId = await eventService.createEvent(eventData, id);
    
    res.status(201).json({ 
      message: 'Event created successfully',
      eventId
    });
  } catch (err) {
    console.error('Event Route Error:', err);
    res.status(500).json({ 
      error: 'Failed to create event',
      details: err.message 
    });
  }
});

// Keep other routes the same
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