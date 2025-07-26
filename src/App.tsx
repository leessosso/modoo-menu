import React, { useEffect, Suspense, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { useAuthStore } from './stores/authStore';
import { useStoreStore } from './stores/storeStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { optimizeWebViewTransition } from './utils/webviewHelper';

// 컴포넌트 Lazy Loading 적용
const LoginScreen = React.lazy(() => import('./components/screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('./components/screens/RegisterScreen'));
const DashboardScreen = React.lazy(() => import('./components/screens/DashboardScreen'));
const StoreOwnerDashboard = React.lazy(() => import('./components/screens/StoreOwnerDashboard'));
const StoreRegisterScreen = React.lazy(() => import('./components/screens/StoreRegisterScreen'));
const StoreEditScreen = React.lazy(() => import('./components/screens/StoreEditScreen'));
const StoreListScreen = React.lazy(() => import('./components/screens/StoreListScreen'));
const CategoryManageScreen = React.lazy(() => import('./components/screens/CategoryManageScreen'));
const MenuManageScreen = React.lazy(() => import('./components/screens/MenuManageScreen'));
const UserProfileScreen = React.lazy(() => import('./components/screens/UserProfileScreen'));
const AccountInfoScreen = React.lazy(() => import('./components/screens/AccountInfoScreen'));
const UserMenuScreen = React.lazy(() => import('./components/screens/UserMenuScreen'));
const CustomerStoreListScreen = React.lazy(() => import('./components/screens/CustomerStoreListScreen'));

// 로딩 스피너 컴포넌트 (WebView 즉시 렌더링 최적화)
const SuspenseLoader = () => (
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
);

// 메인 앱 컴포넌트
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, isHydrated, initializeAuth } = useAuthStore();
  const { subscribeToStores, unsubscribeFromStores, setCurrentStore, stores } = useStoreStore();

  // Firebase 인증 초기화
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // 사용자 역할에 따른 대시보드 결정 (WebView에서 즉시 계산)
  const dashboardRoute = useMemo(() => {
    if (!user) return '/login';

    switch (user.role) {
      case 'store_owner':
        return '/store-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  }, [user?.role]);

  // 매장관리자 사용자 인증 시 매장 데이터 로드
  useEffect(() => {
    if (isAuthenticated && user?.role === 'store_owner' && user.id) {
      console.log('🏪 매장관리자 인증됨, 매장 데이터 구독 시작:', { userId: user.id });
      subscribeToStores(user.id);
    } else {
      console.log('🔕 매장 데이터 구독 해제');
      unsubscribeFromStores();
    }

    return () => {
      unsubscribeFromStores();
    };
  }, [isAuthenticated, user?.role, user?.id, subscribeToStores, unsubscribeFromStores]);

  // 매장 목록이 로드되면 첫 번째 매장을 자동 선택
  useEffect(() => {
    if (stores.length > 0 && user?.role === 'store_owner') {
      console.log('🎯 첫 번째 매장 자동 선택:', stores[0]);
      setCurrentStore(stores[0]);
    }
  }, [stores, user?.role, setCurrentStore]);

  // WebView 렌더링 최적화
  useEffect(() => {
    optimizeWebViewTransition();
  }, [isAuthenticated, user?.role]);

  // persist 미들웨어가 초기화되지 않았거나 로딩 중이면 로딩 스피너 표시
  if (!isHydrated || isLoading) {
    return <LoadingSpinner message="앱을 시작하는 중..." />;
  }

  return (
    <Router>
      <Suspense fallback={<SuspenseLoader />}>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <LoginScreen />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <RegisterScreen />
          } />

          {/* 보호된 라우트 */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="customer">
              <DashboardScreen />
            </ProtectedRoute>
          } />

          {/* 고객용 매장 리스트 */}
          <Route path="/stores" element={
            <ProtectedRoute requiredRole="customer">
              <CustomerStoreListScreen />
            </ProtectedRoute>
          } />

          {/* 매장관리자 대시보드 */}
          <Route path="/store-dashboard" element={
            <ProtectedRoute requiredRole="store_owner">
              <StoreOwnerDashboard />
            </ProtectedRoute>
          } />

          {/* 매장 관리 화면들 */}
          <Route path="/store-register" element={
            <ProtectedRoute requiredRole="store_owner">
              <StoreRegisterScreen />
            </ProtectedRoute>
          } />
          <Route path="/store-edit/:storeId" element={
            <ProtectedRoute requiredRole="store_owner">
              <StoreEditScreen />
            </ProtectedRoute>
          } />
          <Route path="/store-list" element={
            <ProtectedRoute requiredRole="store_owner">
              <StoreListScreen />
            </ProtectedRoute>
          } />

          {/* 메뉴 관리 화면들 */}
          <Route path="/category-manage" element={
            <ProtectedRoute requiredRole="store_owner">
              <CategoryManageScreen />
            </ProtectedRoute>
          } />
          <Route path="/menu-manage" element={
            <ProtectedRoute requiredRole="store_owner">
              <MenuManageScreen />
            </ProtectedRoute>
          } />

          {/* 사용자 정보 관리 화면들 */}
          <Route path="/user-menu" element={
            <ProtectedRoute>
              <UserMenuScreen />
            </ProtectedRoute>
          } />
          <Route path="/user-profile" element={
            <ProtectedRoute>
              <UserProfileScreen />
            </ProtectedRoute>
          } />
          <Route path="/account-info" element={
            <ProtectedRoute>
              <AccountInfoScreen />
            </ProtectedRoute>
          } />

          {/* 기본 리다이렉트 */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <Navigate to="/login" replace />
          } />

          {/* 404 페이지 */}
          <Route path="*" element={
            <Navigate to={isAuthenticated ? dashboardRoute : '/login'} replace />
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
