import api from './api';
import { Booking, Lesson, LoginResponse, PaginatedResponse, Review, User } from '../types';

type PaginationParams = {
  page?: number;
  pageSize?: number;
  professorId?: number;
  alunoId?: number;
  aulaId?: number;
};

export async function loginRequest(email: string, password: string) {
  const response = await api.post<LoginResponse>('/login', { email, password });
  return response.data;
}

export async function fetchMe() {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function fetchUsers(params: PaginationParams) {
  const response = await api.get<PaginatedResponse<User>>('/usuarios', { params });
  return response.data;
}

export async function fetchUser(id: string) {
  const response = await api.get<User>(`/usuarios/${id}`);
  return response.data;
}

export async function createUser(payload: { name: string; email: string; password: string; cpf: string; dataNascimento: string }) {
  const response = await api.post<User>('/usuarios', payload);
  return response.data;
}

export async function updateUser(id: string, payload: { name: string; cpf: string; dataNascimento: string; password?: string; avatarUrl?: string; bio?: string }) {
  const response = await api.put<User>(`/usuarios/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/usuarios/${id}`);
}

export async function fetchLessons(params: PaginationParams) {
  const response = await api.get<PaginatedResponse<Lesson>>('/aulas', { params });
  return response.data;
}

export async function fetchFeaturedLessons() {
  const response = await api.get<Lesson[]>('/aulas/destaque');
  return response.data;
}

export async function fetchLesson(id: string) {
  const response = await api.get<Lesson>(`/aulas/${id}`);
  return response.data;
}

export async function createLesson(payload: { materia: string; valor: number; descricao: string; professorId: number; imageUrl?: string }) {
  const response = await api.post<Lesson>('/aulas', payload);
  return response.data;
}

export async function updateLesson(id: string, payload: { materia: string; valor: number; descricao: string; professorId: number; imageUrl?: string }) {
  const response = await api.put<Lesson>(`/aulas/${id}`, payload);
  return response.data;
}

export async function deleteLesson(id: number) {
  await api.delete(`/aulas/${id}`);
}

export async function fetchBookings(params: PaginationParams) {
  const response = await api.get<PaginatedResponse<Booking>>('/agendamentos', { params });
  return response.data;
}

export async function fetchBooking(id: string) {
  const response = await api.get<Booking>(`/agendamentos/${id}`);
  return response.data;
}

export async function createBooking(payload: { alunoId: number; aulaId: number; data: string }) {
  const response = await api.post<Booking>('/agendamentos', payload);
  return response.data;
}

export async function updateBooking(id: string, payload: { alunoId: number; aulaId: number; data: string }) {
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

export async function createReview(id: number, payload: { aulaId: number; alunoId: number; nota: number; comentario?: string }) {
  const response = await api.post<Review>(`/aulas/${id}/avaliacoes`, payload);
  return response.data;
}
