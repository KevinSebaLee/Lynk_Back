import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as eventService from '../services/eventService.js';
import { upload } from '../middleware/multer.js';
import path from 'path';
import fs from 'fs'; 

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
    const eventData = { ...req.body, imagen: null };
    const eventId = await eventService.createEvent(eventData, id);

    let imagePath = null;

    if (req.file) {
      const finalDir = path.join(process.cwd(), 'uploads/events', String(eventId));
      fs.mkdirSync(finalDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '.jpg';
      const finalPath = path.join(finalDir, 'photo' + ext);
      fs.renameSync(req.file.path, finalPath);
      imagePath = `/uploads/events/${eventId}/photo${ext}`;

      await eventService.updateEvent({ id: eventId, imagen: imagePath });
    }

    res.status(201).json({ message: 'Event created successfully', eventId, image: imagePath });
  } catch (err) {
    console.error('Event Route Error:', err);
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen } = req.body
  
  try {
    const eventData = [
      id,
      id_categoria, 
      nombre, 
      descripcion, 
      fecha, 
      ubicacion, 
      visibilidad, 
      presupuesto, 
      objetivo, 
      color, 
      imagen
    ]
  
    const updatedEvent = await eventService.updateEvent(eventData)

    res.status(201).json({
      message: 'Event updated successfully',
    });

  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to update event',
      details: err.message
    })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(err.message === 'Event not found' ? 404 : 500).json({ error: err.message });
  }
})

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