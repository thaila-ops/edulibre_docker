import api from './api';
import { LoginResponse } from '../types/auth';

export async function loginRequest(
  email: string,
  password: string,
) {
  const response = await api.post<LoginResponse>('/login', {
    email,
    password,
  });

  return response.data;
}