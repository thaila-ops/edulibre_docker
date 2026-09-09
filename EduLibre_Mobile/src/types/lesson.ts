export type Lesson = {
  id: number;
  materia: string;
  valor: number;
  descricao: string | null;
  imageUrl: string | null;
  professorId: number;
  status?: 'ativa' | 'bloqueada';
  professor?: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};