import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: string;
};

function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div className="center-card">Carregando sessão...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole =
    !requiredRole ||
    user?.isSuperAdmin ||
    user?.roles?.includes(requiredRole);

  if (!hasRequiredRole) {
    return <Navigate to="/conta" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;