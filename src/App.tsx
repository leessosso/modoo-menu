import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { useAuthStore } from './stores/authStore';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import StoreOwnerDashboard from './components/screens/StoreOwnerDashboard';
import StoreRegisterScreen from './components/screens/StoreRegisterScreen';
import StoreListScreen from './components/screens/StoreListScreen';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// 메인 앱 컴포넌트
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, isHydrated, initializeAuth } = useAuthStore();

  // Firebase 인증 초기화
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // 디버깅을 위한 상태 로그
  console.log('App 상태:', { isAuthenticated, isLoading, isHydrated, user: user?.email });

  // persist 미들웨어가 초기화되지 않았거나 로딩 중이면 로딩 스피너 표시
  if (!isHydrated || isLoading) {
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

        {/* 매장 관리 화면들 */}
        <Route path="/store-register" element={
          <ProtectedRoute>
            <StoreRegisterScreen />
          </ProtectedRoute>
        } />
        <Route path="/store-list" element={
          <ProtectedRoute>
            <StoreListScreen />
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
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
