export type UserRole = 'usuario' | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;    
  cpf: string;
  dataNascimento: string | null;
  tipo: UserRole;
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
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
  status?: 'ativa' | 'bloqueada';
  motivoBloqueio?: string | null;
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

export type AdminDashboardStats = {
  totalUsuarios: number;
  totalAlunos: number;
  totalProfessores: number;
  totalAdmins: number;
  totalModeradores: number;
  totalAulas: number;
  aulasAtivas: number;
  aulasBloqueadas: number;
};
export type Notification = {
  id: number;
  userId: number;
  aulaId: number | null;
  tipo: 'aula_bloqueada' | 'aula_desbloqueada';
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
  updatedAt: string;
};