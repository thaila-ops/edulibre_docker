export type UserRole = 'usuario';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  dataNascimento: Date | null;
  tipo: UserRole;
  avatarUrl: string | null;
  bio: string | null;
};

export type PaymentStatus = 'pendente' | 'pago';

export type PaginationResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type JwtPayloadData = {
  id: number;
  email: string;
  tipo: UserRole;
};
