const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Obtener todas las notificaciones de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.params.userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones', details: err.message });
  }
});

// Crear una notificación
router.post('/', async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    const notification = await notificationService.createNotification(userId, type, data);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear notificación', details: err.message });
  }
});

// Marcar una notificación como leída
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.notificationId);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar notificación', details: err.message });
  }
});

module.exports = router;








