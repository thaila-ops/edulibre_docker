import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchMe, loginRequest } from '../services/http';
import { clearSession, getStoredToken, getStoredUser, saveSession } from '../services/storage';
import { User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return setLoading(false);
    fetchMe().then(setUser).catch(handleLogout).finally(() => setLoading(false));
  }, [token]);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    saveSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    handleLogout();
  }

  async function refreshUser() {
    const nextUser = await fetchMe();
    setUser(nextUser);
    if (token) saveSession(token, nextUser);
  }

  function handleLogout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = { user, token, loading, login, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext deve ser usado dentro de AuthProvider.');
  return context;
}
