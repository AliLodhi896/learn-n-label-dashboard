import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />;
  }

  return children;
};

export default ProtectedRoute;
