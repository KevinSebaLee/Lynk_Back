// src/services/notificationService.js

const Notification = require('../database/models/Notification');

/**
 * Crear una notificación para un usuario
 * @param {String} userId - ID del usuario destino
 * @param {String} type - Tipo de notificación (ej: 'invitacion_evento')
 * @param {Object} data - Datos adicionales (ej: { eventId, fromUserId, mensaje })
 * @returns {Promise<Notification>}
 */
async function createNotification(userId, type, data = {}) {
  const notification = new Notification({
    userId,
    type,
    data,
    read: false,
    createdAt: new Date(),
  });
  return await notification.save();
}

/**
 * Obtener todas las notificaciones de un usuario
 * @param {String} userId
 * @returns {Promise<Array<Notification>>}
 */
async function getUserNotifications(userId) {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
}

/**
 * Marcar una notificación como leída
 * @param {String} notificationId
 * @returns {Promise<Notification>}
 */
async function markNotificationAsRead(notificationId) {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
};