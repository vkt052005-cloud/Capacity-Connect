import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, isInitialized, logout } = useAuthStore();
  const { users } = useUsersStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user account was removed by an administrator in current session OR in database
  const matchingDbUser = users.find(
    (u) => u.id === currentUser.id || (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
  );
  const isRemoved = currentUser.status === "removed" || matchingDbUser?.status === "removed";

  if (isRemoved) {
    logout();
    return <Navigate to="/login?removed=true" replace />;
  }

  if (matchingDbUser && matchingDbUser.status !== "active") {
    logout();
    return <Navigate to="/login?pending=true" replace />;
  }

  if (currentUser.status !== "active") {
    logout();
    return <Navigate to="/login?pending=true" replace />;
  }

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

