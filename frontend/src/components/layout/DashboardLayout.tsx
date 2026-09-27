import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  role?: UserRole;
}

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const { authState } = useAuthContext();
  const location = useLocation();

  // Redirect if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Use the provided role or the user's role
  const userRole = role || authState.user?.role;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar role={userRole as UserRole} />
        <div className="flex-1 flex flex-col">
          <Header user={authState.user} />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
