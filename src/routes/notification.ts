import express from 'express';
import * as notificationService from '../services/notificationService.js';

const router = express.Router();

// Obtener todas las notificaciones de un usuario
router.get('/:id_user', async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.params.id_user);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones', details: (err as Error).message });
  }
});

// Crear una notificación
router.post('/', async (req, res) => {
  try {
    const { id_user, nombre, descripcion } = req.body;
    const notification = await notificationService.createNotification(id_user, nombre, descripcion);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear notificación', details: (err as Error).message });
  }
});

// Marcar una notificación como leída
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar notificación', details: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await notificationService.deleteNotification(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar notificación', details: (err as Error).message });
  }
});

export default router;