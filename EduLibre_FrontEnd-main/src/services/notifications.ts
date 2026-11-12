import type { Notification } from '../types';
import api from './api';

export async function fetchNotifications() {
  const response = await api.get<Notification[]>('/notificacoes');
  return response.data;
}

export async function markNotificationAsRead(id: number) {
  const response = await api.patch<Notification>(`/notificacoes/${id}/lida`);

  return response.data;
}
