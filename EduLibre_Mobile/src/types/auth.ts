export type AuthUser = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};