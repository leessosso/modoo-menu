import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import StoreOwnerDashboard from './components/screens/StoreOwnerDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// 메인 앱 컴포넌트
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="앱을 시작하는 중..." />;
  }

  // 사용자 역할에 따른 대시보드 결정
  const getDashboardRoute = () => {
    if (!user) return '/login';

    switch (user.role) {
      case 'store_owner':
        return '/store-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <Router>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <LoginScreen />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <RegisterScreen />
        } />

        {/* 보호된 라우트 */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardScreen />
          </ProtectedRoute>
        } />

        {/* 매장관리자 대시보드 */}
        <Route path="/store-dashboard" element={
          <ProtectedRoute>
            <StoreOwnerDashboard />
          </ProtectedRoute>
        } />

        {/* 기본 리다이렉트 */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Navigate to="/login" replace />
        } />

        {/* 404 페이지 */}
        <Route path="*" element={
          <Navigate to={isAuthenticated ? getDashboardRoute() : "/login"} replace />
        } />
      </Routes>
    </Router>
  );
};

// 루트 앱 컴포넌트
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
