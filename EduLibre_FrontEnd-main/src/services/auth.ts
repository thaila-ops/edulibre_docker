import type { LoginResponse, User } from '../types';
import api from './api';

export async function loginRequest(email: string, password: string) {
  const response = await api.post<LoginResponse>('/login', { email, password });
  return response.data;
}

export async function fetchMe() {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function becomeProfessor() {
  await api.post('/usuarios/me/tornar-professor');
}
