import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'store_owner' | 'admin';
  allowedRoles?: readonly ('customer' | 'store_owner' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // 로딩 중일 때
  if (isLoading) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }

  // 인증되지 않은 사용자
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 사용자가 존재하고 역할 제한이 있는 경우
  if (user && (requiredRole || allowedRoles)) {
    const userRole = user.role;
    const hasRequiredRole = requiredRole ? userRole === requiredRole : true;
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(userRole) : true;

    // 역할 권한이 없는 경우 적절한 대시보드로 리다이렉트
    if (!hasRequiredRole || !hasAllowedRole) {
      const redirectPath = userRole === 'store_owner' ? '/store-dashboard' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 