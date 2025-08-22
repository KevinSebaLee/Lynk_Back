import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as eventService from '../services/eventService.js';
import { upload } from '../middleware/multer.js';

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

router.put('/:id', requireAuth, async(req, res) => {
  const id = req.params.id
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen } = req.body

  try{
    const event = await eventService.updateEvent(id)
    if(!event){
      
    }

    const eventData = [
      nombre ?? event.nombre,
      descripcion ?? event.descripcion,
      fecha ?? event.fecha,
      ubicacion ?? event.ubicacion,
      visibilidad ?? event.visibilidad,
      presupuesto ?? event.presupuesto,
      objetivo ?? event.objetivo,
      color ?? event.color,
      imagen ?? event.imagen,
      id_categoria ?? event.id_categoria,
      id
    ]

    const updatedEvent = await eventService.updateEvent(eventData)

    res.status(201).json({ 
      message: 'Event updated successfully',
    });

  }catch(err){
    console.error(err)
    res.status(500).json({
      error: 'Failed to update event',
      details: err.message
    })
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