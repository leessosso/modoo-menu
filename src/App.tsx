import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// 컴포넌트 Lazy Loading 적용
const LoginScreen = React.lazy(() => import('./components/screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('./components/screens/RegisterScreen'));
const DashboardScreen = React.lazy(() => import('./components/screens/DashboardScreen'));
const StoreOwnerDashboard = React.lazy(() => import('./components/screens/StoreOwnerDashboard'));
const StoreRegisterScreen = React.lazy(() => import('./components/screens/StoreRegisterScreen'));
const StoreListScreen = React.lazy(() => import('./components/screens/StoreListScreen'));

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
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #1976d2',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>화면 전환 중...</p>
          </div>
        </div>
      }>
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
            <Navigate to={isAuthenticated ? getDashboardRoute() : '/login'} replace />
          } />
        </Routes>
      </Suspense>
    </Router>
  );
};

// 루트 앱 컴포넌트
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
