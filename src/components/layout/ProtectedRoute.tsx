import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.status !== "active") return <Navigate to="/login?pending=true" replace />;
  // Administrators have global oversight and can inspect all portals and features
  if (currentUser.role === "admin") {
    return <>{children}</>;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const redirects: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      trainer: '/trainer/dashboard',
      trainee: '/trainee/dashboard',
    };
    return <Navigate to={redirects[currentUser.role]} replace />;
  }
  return <>{children}</>;
};
