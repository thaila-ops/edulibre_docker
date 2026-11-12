import type { Lesson, PaginatedResponse } from '../types';
import api from './api';
import type { PaginationParams } from './types';

export async function fetchLessons(params: PaginationParams) {
  const response = await api.get<PaginatedResponse<Lesson>>('/aulas', {
    params,
  });
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

type LessonPayload = {
  materia: string;
  valor: number;
  descricao: string;
  professorId: number;
  image?: File | null;
  imageUrl?: string;
};

function lessonPayloadToFormData(payload: LessonPayload) {
  const formData = new FormData();

  formData.append('materia', payload.materia);
  formData.append('valor', String(payload.valor));
  formData.append('descricao', payload.descricao);
  formData.append('professorId', String(payload.professorId));

  if (payload.image) {
    formData.append('image', payload.image);
  } else if (payload.imageUrl) {
    formData.append('imageUrl', payload.imageUrl);
  }

  return formData;
}

export async function createLesson(payload: LessonPayload) {
  const response = await api.post<Lesson>(
    '/aulas',
    lessonPayloadToFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function updateLesson(id: string, payload: LessonPayload) {
  const response = await api.put<Lesson>(
    `/aulas/${id}`,
    lessonPayloadToFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function deleteLesson(id: number) {
  await api.delete(`/aulas/${id}`);
}
