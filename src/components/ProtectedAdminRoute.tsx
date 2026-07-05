import { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedAdminRoute = (): ReactElement => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elvar-bg flex items-center justify-center px-6">
        <span className="text-elvar-muted text-sm uppercase tracking-[0.35em]">
          Verifying administrator access…
        </span>
      </div>
    );
  }

  return isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/elvar-portal" state={{ from: location }} replace />
  );
};

export default ProtectedAdminRoute;
