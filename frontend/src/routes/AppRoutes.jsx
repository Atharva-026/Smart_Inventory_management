import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

// Landing Page
import LandingPage from '../pages/LandingPage';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Student Pages
import Dashboard from '../pages/student/Dashboard';
import ScanItem from '../pages/student/ScanItem';
import MyTransactions from '../pages/student/MyTransactions';
import Profile from '../pages/student/Profile';

// Admin Pages (Used by both Admin and Faculty)
import AdminDashboard from '../pages/admin/AdminDashboard';
import InventoryManagement from '../pages/admin/InventoryManagement';
import QRGenerator from '../pages/admin/QRGenerator';
import AllTransactions from '../pages/admin/AllTransactions';
import UserManagement from '../pages/admin/UserManagement';
import Analytics from '../pages/admin/Analytics';

// Faculty-Specific Pages (Inside admin folder)
import SendInvitations from '../pages/admin/SendInvitations';
import MyStudents from '../pages/admin/MyStudents';

// Admin-Only Pages
import RegisterFaculty from '../pages/admin/RegisterFaculty';

// Route Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// Layout
import NavigationBar from '../components/common/Navbar';

// ✅ NEW: Smart Register Route Component
const RegisterRoute = () => {
  const { user, isAdmin, isFaculty } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const hasInvitationCode = searchParams.get('code');

  // If user exists AND no invitation code, redirect based on role
  if (user && !hasInvitationCode) {
    if (isAdmin() || isFaculty()) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Allow registration if invitation code exists, even if user is logged in
  return <Register />;
};

const AppRoutes = () => {
  const { user, isAdmin, isFaculty } = useContext(AuthContext);

  // Faculty Route Guard
  const FacultyRoute = ({ children }) => {
    const { user, loading, isFaculty, isAdmin } = useContext(AuthContext);
    
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // Both Faculty and Admin can access
    return (isFaculty() || isAdmin()) ? children : <Navigate to="/dashboard" replace />;
  };

  return (
    <>
      {user && <NavigationBar />}
      <Routes>
        {/* Landing Page */}
        <Route 
          path="/" 
          element={
            !user ? (
              <LandingPage />
            ) : (
              <Navigate to={isAdmin() || isFaculty() ? "/admin" : "/dashboard"} replace />
            )
          } 
        />

        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            !user ? (
              <Login />
            ) : (
              <Navigate to={isAdmin() || isFaculty() ? "/admin" : "/dashboard"} replace />
            )
          } 
        />
        
        {/* ✅ FIXED: Smart Register Route - Allows invitation-based registration */}
        <Route path="/register" element={<RegisterRoute />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/scan" element={<PrivateRoute><ScanItem /></PrivateRoute>} />
        <Route path="/my-transactions" element={<PrivateRoute><MyTransactions /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin & Faculty Shared Routes */}
        <Route path="/admin" element={<FacultyRoute><AdminDashboard /></FacultyRoute>} />
        <Route path="/admin/inventory" element={<FacultyRoute><InventoryManagement /></FacultyRoute>} />
        <Route path="/admin/qr-generator" element={<FacultyRoute><QRGenerator /></FacultyRoute>} />
        <Route path="/admin/transactions" element={<FacultyRoute><AllTransactions /></FacultyRoute>} />

        {/* Faculty-Only Routes */}
        <Route path="/admin/send-invitations" element={<FacultyRoute><SendInvitations /></FacultyRoute>} />
        <Route path="/admin/my-students" element={<FacultyRoute><MyStudents /></FacultyRoute>} />

        {/* Admin-Only Routes */}
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
        <Route path="/admin/register-faculty" element={<AdminRoute><RegisterFaculty /></AdminRoute>} />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="container mt-5 text-center">
              <h1>404 - Page Not Found</h1>
              <p className="text-muted">The page you're looking for doesn't exist.</p>
            </div>
          } 
        />
      </Routes>
    </>
  );
};

export default AppRoutes;