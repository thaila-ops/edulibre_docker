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
export type LessonImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

type CreateLessonPayload = {
  materia: string;
  valor: number;
  descricao: string;
  professorId: number;
  image?: LessonImage | null;
};

type UpdateLessonPayload = {
  materia: string;
  valor: number;
  descricao: string;
  professorId: number;
  image?: LessonImage | null;
};

function lessonPayloadToFormData(
  payload: CreateLessonPayload | UpdateLessonPayload,
) {
  const formData = new FormData();

  formData.append('materia', payload.materia);
  formData.append('valor', String(payload.valor));
  formData.append('descricao', payload.descricao);
  formData.append('professorId', String(payload.professorId));

  if (payload.image) {
    formData.append(
      'image',
      {
        uri: payload.image.uri,
        name: payload.image.fileName ?? `aula-${Date.now()}.jpg`,
        type: payload.image.mimeType ?? 'image/jpeg',
      } as any,
    );
  }

  return formData;
}

export async function createLesson(payload: CreateLessonPayload) {
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

export async function updateLesson(id: number, payload: UpdateLessonPayload) {
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