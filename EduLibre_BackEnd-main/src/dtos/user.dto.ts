export type UserInput = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  dataNascimento: string;
  tipo: string;
  avatarUrl?: string;
  bio?: string;
};

export type UserUpdate = {
  name: string;
  cpf: string;
  dataNascimento: string;
  tipo: string;
  password?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
};

export type PageParams = {
  page?: string;
  pageSize?: string;
};
