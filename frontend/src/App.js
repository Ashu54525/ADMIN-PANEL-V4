import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/AdminLayout';
import UserLayout from './pages/UserLayout';

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36 }}></div>
      <span>Loading…</span>
    </div>
  );

  if (!user) return <LoginPage />;
  if (user.role === 'admin') return <AdminLayout />;
  return <UserLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" style={{ fontSize: 13 }} />
    </AuthProvider>
  );
}
