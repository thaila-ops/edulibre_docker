import api from './api';
import {
  Lesson,
  PaginatedResponse,
} from '../types/lesson';

export async function fetchLessons() {
  const response = await api.get<PaginatedResponse<Lesson>>('/aulas', {
    params: {
      page: 1,
      pageSize: 50,
    },
  });

  return response.data;
}

export async function fetchLessonsByProfessor(professorId: number) {
  const response = await api.get<PaginatedResponse<Lesson>>('/aulas', {
    params: {
      page: 1,
      pageSize: 50,
      professorId,
    },
  });

  return response.data;
}
type CreateLessonPayload = {
  materia: string;
  valor: number;
  descricao: string;
  professorId: number;
};

export async function createLesson(payload: CreateLessonPayload) {
  const response = await api.post<Lesson>('/aulas', payload);
  return response.data;
}
type UpdateLessonPayload = {
  materia: string;
  valor: number;
  descricao: string;
  professorId: number;
};

export async function updateLesson(id: number, payload: UpdateLessonPayload) {
  const response = await api.put<Lesson>(`/aulas/${id}`, payload);
  return response.data;
}

export async function deleteLesson(id: number) {
  await api.delete(`/aulas/${id}`);
}