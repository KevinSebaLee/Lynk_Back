import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as eventService from '../services/eventService.js';
import { upload } from '../middleware/multer.js';
import path from 'path';
import nodemailer from 'nodemailer';
import pool from '../database/pgClient.js';


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
    const eventData = { ...req.body };

    const { eventId, imagePath } = await eventService.createEvent(eventData, id, req.file);

    res.status(201).json({ message: 'Event created successfully', eventId, image: imagePath });
  } catch (err) {
    console.error('Event Route Error:', err);
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

router.put('/:id', requireAuth, upload.single('imagen'), async (req, res) => {
  const id = req.params.id
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color } = req.body
  
  try {
    const eventData = {
      id,
      id_categoria, 
      nombre, 
      descripcion, 
      fecha, 
      ubicacion, 
      visibilidad, 
      presupuesto, 
      objetivo, 
      color
    };
  
    // Pass the file to the service for handling
    const updatedEvent = await eventService.updateEvent(eventData, req.file);

    res.status(200).json({
      message: 'Event updated successfully',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update event',
      details: err.message
    });
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  console.log('Delete event request for ID:', req.params.id, 'by user:', req.user.id);
  try {
    await eventService.deleteEvent(req.params.id, req.user.id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(err.message === 'Event not found' ? 404 : 500).json({ error: err.message });
    }
})

router.post('/send-cancellation', async (req, res) => {
  const { recipients, eventName } = req.body;
  if (!recipients || recipients.length === 0) return res.status(400).send('No recipients');

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'eventoslynk@gmail.com',
      pass: 'uvevgrmbfhrfsdoa', // Usa variables de entorno en producción
    }
  });

  const mailOptions = {
    from: '"Lynk Eventos" <eventoslynk@gmail.com>',
    subject: `Cancelación del evento: ${eventName}`,
    text: `Lamentamos informarte que el evento "${eventName}" ha sido cancelado.`
  };

  try {
    for (const email of recipients) {
      await transporter.sendMail({ ...mailOptions, to: email });
    }
    res.send('Correos enviados');
  } catch (error) {
  
    res.status(500).send(error.message);
  }
});

router.get('/:id/participantes', async (req, res) => {
  const { id } = req.params;
  const participantes = await eventService.getEventParticipants(id);
  res.json(participantes.map(p => p.Usuario));
});

router.post('/:id/agendar', requireAuth, async (req, res) => {
      console.error('HOLAA');

  try {
    await eventService.agendarEvent(req.params.id, req.user.id);
    res.status(201).json({ message: 'Event scheduled successfully' });
  } catch (err) {
    res.status(err.message === 'Event already registered' ? 409 : 500).json({ error: err.message });
  }
});

router.get('/:id/inscripciones-mensuales', async (req, res) => {
  const { id } = req.params;
  console.log('Fetching monthly inscriptions for event ID:', id);
  try {
    const query = `
      SELECT EXTRACT(MONTH FROM date) AS month,
             COUNT(*) AS inscriptions
        FROM "EventosAgendados"
       WHERE id_evento = $1
       GROUP BY month
       ORDER BY month ASC
    `;
    const { rows } = await pool.query(query, [id]);
    const result = rows.map(row => ({
      month: Number(row.month),
      inscriptions: Number(row.inscriptions)
    }));
    res.json(result);
  } catch (err) {
    console.error('Error al obtener inscripciones mensuales:', err);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
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