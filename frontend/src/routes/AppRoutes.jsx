import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Student Pages
import Dashboard from '../pages/student/Dashboard';
import ScanItem from '../pages/student/ScanItem';
import MyTransactions from '../pages/student/MyTransactions';
import Profile from '../pages/student/Profile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import InventoryManagement from '../pages/admin/InventoryManagement';
import QRGenerator from '../pages/admin/QRGenerator';
import AllTransactions from '../pages/admin/AllTransactions';
import UserManagement from '../pages/admin/UserManagement';
import Analytics from '../pages/admin/Analytics';

// Route Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// Layout
import NavigationBar from '../components/common/Navbar';

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user && <NavigationBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Student/Faculty Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/scan" element={<PrivateRoute><ScanItem /></PrivateRoute>} />
        <Route path="/my-transactions" element={<PrivateRoute><MyTransactions /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><InventoryManagement /></AdminRoute>} />
        <Route path="/admin/qr-generator" element={<AdminRoute><QRGenerator /></AdminRoute>} />
        <Route path="/admin/transactions" element={<AdminRoute><AllTransactions /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<div className="container mt-5 text-center"><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </>
  );
};

export default AppRoutes;