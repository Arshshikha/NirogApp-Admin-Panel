import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login' 
}) => {
  const token = localStorage.getItem('admin_token');
  const role = localStorage.getItem('user_role');

  if (!token || role !== 'ADMIN') {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
