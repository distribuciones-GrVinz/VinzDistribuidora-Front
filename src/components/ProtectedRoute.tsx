import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir a login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireProfile && user && user.rol !== 'Administrador' && !user.perfil_completado) {
    // Si requiere perfil, no lo tiene, Y NO ES ADMIN, redirigir a Onboarding
    return <Navigate to="/completar-perfil" replace />;
  }

  if (!requireProfile && user && user.rol !== 'Administrador' && user.perfil_completado && location.pathname === '/completar-perfil') {
    // Si no requiere perfil (está en la página de onboarding) pero ya lo completó, llevarlo al catálogo
    return <Navigate to="/catalogo" replace />;
  }

  return children;
}
