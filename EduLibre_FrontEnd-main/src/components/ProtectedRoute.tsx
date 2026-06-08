import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="center-card">Carregando sessão...</div>;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
