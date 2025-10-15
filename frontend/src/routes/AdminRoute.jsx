import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);
  
  if (loading) {
    return <Loader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return isAdmin() ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;