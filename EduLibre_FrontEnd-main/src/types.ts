export type UserRole = 'usuario';

export type User = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  dataNascimento: string | null;
  tipo: UserRole;
  avatarUrl: string | null;
  bio: string | null;
};

export type Review = {
  id: number;
  aulaId: number;
  alunoId: number;
  nota: number;
  comentario: string | null;
  aluno?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
};

export type Lesson = {
  id: number;
  materia: string;
  valor: number;
  descricao: string | null;
  imageUrl: string | null;
  professorId: number;
  professor?: User;
  averageRating?: number;
  reviewCount?: number;
  bookingCount?: number;
  paidBookingCount?: number;
  avaliacoes?: Review[];
};

export type Booking = {
  id: number;
  alunoId: number;
  aulaId: number;
  data: string;
  bookingStatus?: 'pendente' | 'aceito' | 'recusado';
  paymentStatus?: 'pendente' | 'pago';
  aluno?: User;
  aula?: Lesson;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
};
