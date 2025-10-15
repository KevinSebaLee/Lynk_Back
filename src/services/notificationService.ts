import NotificationRepository from '../repositories/notificationRepository.js';
import db from '../database/pgClient.js';

const notificationRepository = new NotificationRepository(db);

export async function createNotification(id_user: string | number, nombre: string, descripcion: string): Promise<any> {
  return await notificationRepository.createNotification({
    id_user,
    nombre,
    descripcion,
    leida: false,
    fecha_creacion: new Date()
  });
}

export async function getUserNotifications(id_user: string | number): Promise<any[]> {
  return await notificationRepository.getNotificationsByUser(id_user);
}

export async function markNotificationAsRead(id: string | number): Promise<any> {
  return await notificationRepository.markNotificationAsRead(id);
}

export async function deleteNotification(id: string | number): Promise<void> {
  return await notificationRepository.deleteNotification(id);
}