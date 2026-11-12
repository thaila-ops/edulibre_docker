import type { Review } from '../types';
import api from './api';

export async function createReview(
  id: number,
  payload: {
    aulaId: number;
    alunoId: number;
    nota: number;
    comentario?: string;
  },
) {
  const response = await api.post<Review>(`/aulas/${id}/avaliacoes`, payload);
  return response.data;
}
