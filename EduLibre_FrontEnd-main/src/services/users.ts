import type { PaginatedResponse, User } from '../types';
import api from './api';
import type { PaginationParams } from './types';

export async function fetchUsers(params: PaginationParams) {
  const response = await api.get<PaginatedResponse<User>>('/usuarios', {
    params,
  });
  return response.data;
}

export async function fetchUser(id: string) {
  const response = await api.get<User>(`/usuarios/${id}`);
  return response.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  cpf: string;
  dataNascimento: string;
}) {
  const response = await api.post<User>('/usuarios', payload);
  return response.data;
}

type UpdateUserPayload = {
  name: string;
  cpf: string;
  dataNascimento: string;
  password?: string;
  avatar?: File | null;
  avatarUrl?: string;
  bio?: string;
};

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('cpf', payload.cpf);
  formData.append('dataNascimento', payload.dataNascimento);
  formData.append('bio', payload.bio ?? '');

  if (payload.password) {
    formData.append('password', payload.password);
  }

  if (payload.avatar) {
    formData.append('avatar', payload.avatar);
  } else if (payload.avatarUrl) {
    formData.append('avatarUrl', payload.avatarUrl);
  }

  const response = await api.put<User>(`/usuarios/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/usuarios/${id}`);
}
