export type AgendamentoPayload = {
  alunoId: number;
  aulaId: number;
  data: string;
};

export type AgendamentoFilters = {
  alunoId?: string;
  aulaId?: string;
  professorId?: string;
  page?: string;
  pageSize?: string;
};
