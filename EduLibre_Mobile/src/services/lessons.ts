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