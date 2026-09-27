import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { authState } = useAuthContext();

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(authState.user?.role as UserRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
};
