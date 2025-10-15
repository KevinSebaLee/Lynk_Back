import NotificationRepository from '../repositories/notificationRepository.js';

export async function createNotification(id_user: string | number, nombre: string, descripcion: string): Promise<any> {
  return await NotificationRepository.createNotification({
    id_user,
    nombre,
    descripcion,
    leida: false,
    fecha_creacion: new Date()
  });
}

export async function getUserNotifications(id_user: string | number): Promise<any[]> {
  return await NotificationRepository.getNotificationsByUser(id_user);
}

export async function markNotificationAsRead(id: string | number): Promise<any> {
  return await NotificationRepository.markNotificationAsRead(id);
}

export async function deleteNotification(id: string | number): Promise<void> {
  return await NotificationRepository.deleteNotification(id);
}