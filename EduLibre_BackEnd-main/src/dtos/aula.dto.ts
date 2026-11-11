export type AulaPayload = {
  materia: string;
  valor: number;
  descricao?: string;
  professorId: number;
  imageUrl?: string;
};

export type AulaFilters = {
  materia?: string;
  professorId?: string;
  page?: string;
  pageSize?: string;
  status?: string;
};
