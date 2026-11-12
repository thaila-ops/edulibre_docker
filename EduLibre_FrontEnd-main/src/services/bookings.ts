import type { Booking, PaginatedResponse } from '../types';
import api from './api';
import type { PaginationParams } from './types';

export async function fetchBookings(params: PaginationParams) {
  const response = await api.get<PaginatedResponse<Booking>>('/agendamentos', {
    params,
  });
  return response.data;
}

export async function fetchBooking(id: string) {
  const response = await api.get<Booking>(`/agendamentos/${id}`);
  return response.data;
}

export async function createBooking(payload: {
  alunoId: number;
  aulaId: number;
  data: string;
}) {
  const response = await api.post<Booking>('/agendamentos', payload);
  return response.data;
}

export async function updateBooking(
  id: string,
  payload: { alunoId: number; aulaId: number; data: string },
) {
  const response = await api.put<Booking>(`/agendamentos/${id}`, payload);
  return response.data;
}

export async function payBooking(id: number) {
  const response = await api.patch<Booking>(`/agendamentos/${id}/pagar`);
  return response.data;
}

export async function acceptBooking(id: number) {
  const response = await api.patch<Booking>(`/agendamentos/${id}/aceitar`);
  return response.data;
}

export async function rejectBooking(id: number) {
  const response = await api.patch<Booking>(`/agendamentos/${id}/recusar`);
  return response.data;
}

export async function deleteBooking(id: number) {
  await api.delete(`/agendamentos/${id}`);
}
