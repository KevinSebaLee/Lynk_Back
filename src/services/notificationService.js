import NotificationRepository from '../repositories/notificationRepository.js';
import db from '../database/pgClient.js';

const notificationRepository = new NotificationRepository(db);

export async function createNotification(id_user, nombre, descripcion) {
  return await notificationRepository.createNotification({
    id_user,
    nombre,
    descripcion,
    leida: false,
    fecha_creacion: new Date()
  });
}

export async function getUserNotifications(id_user) {
  return await notificationRepository.getNotificationsByUser(id_user);
}

export async function markNotificationAsRead(id) {
  return await notificationRepository.markNotificationAsRead(id);
}