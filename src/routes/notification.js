import express from 'express';
import * as notificationService from '../services/notificationService.js';

const router = express.Router();

// Obtener todas las notificaciones de un usuario
router.get('/:id_user', async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.params.id_user);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones', details: err.message });
  }
});

// Crear una notificación
router.post('/', async (req, res) => {
  try {
    const { id_user, nombre, descripcion } = req.body;
    const notification = await notificationService.createNotification(id_user, nombre, descripcion);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear notificación', details: err.message });
  }
});

// Marcar una notificación como leída
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar notificación', details: err.message });
  }
});

export default router;