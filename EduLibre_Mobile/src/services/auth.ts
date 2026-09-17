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
type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  dataNascimento: string;
};

export async function registerRequest(payload: RegisterPayload) {
  const response = await api.post('/usuarios', payload);
  return response.data;
}