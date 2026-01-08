import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay fullScreen message="Verifying session..." />;
  }

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

