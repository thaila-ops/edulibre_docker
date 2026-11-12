import type { AdminDashboardStats, Lesson, PaginatedResponse } from '../types';
import api from './api';

export async function fetchAdminDashboard() {
  const response = await api.get<AdminDashboardStats>('/admin/dashboard');

  return response.data;
}

export async function fetchAdminLessons() {
  const response = await api.get<PaginatedResponse<Lesson>>('/admin/aulas', {
    params: {
      status: 'all',
      pageSize: 50,
    },
  });

  return response.data;
}

export async function blockLesson(id: number, motivo: string) {
  const response = await api.patch<Lesson>(`/aulas/${id}/bloquear`, { motivo });

  return response.data;
}

export async function unblockLesson(id: number) {
  const response = await api.patch<Lesson>(`/aulas/${id}/desbloquear`);

  return response.data;
}
