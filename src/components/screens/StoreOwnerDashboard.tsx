import React, { useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  MenuBook,
  Receipt,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import AppHeader from '../common/AppHeader';
import EmptyState from '../common/EmptyState';
import { UI_CONSTANTS, APP_CONFIG } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import type { Store } from '../../types/store';

const StoreOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { stores, setCurrentStore } = useStoreStore();

  // 디버깅용 stores 상태 출력
  useEffect(() => {
    console.log('📊 현재 stores 상태:', { stores, count: stores.length });
  }, [stores]);

  useEffect(() => {
    console.log('🔄 StoreOwnerDashboard 렌더링:', {
      user: user ? { id: user.id, name: user.name, role: user.role } : null,
      storesCount: stores.length
    });

    // WebView 렌더링 최적화
    optimizeWebViewTransition();
  }, [user, stores]);

  const handleLogout = useCallback(async () => {
    try {
      // 로컬 상태 즉시 클리어 (웹뷰에서 가장 안전한 방법)
      localStorage.clear();
      sessionStorage.clear();

      // Firebase 로그아웃 시도 (실패해도 무시)
      try {
        await logout();
      } catch (logoutError) {
        console.warn('Firebase 로그아웃 실패 (무시됨):', logoutError);
      }

      // 페이지 새로고침으로 완전히 초기화
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 최후의 수단: 강제 새로고침
      window.location.reload();
    }
  }, [logout]);

  const handleAddStore = useCallback(() => {
    optimizeWebViewTransition(() => {
      navigate(APP_CONFIG.ROUTES.STORE_REGISTER);
    });
  }, [navigate]);

  const handleStoresList = useCallback(() => {
    optimizeWebViewTransition(() => {
      navigate(APP_CONFIG.ROUTES.STORE_LIST);
    });
  }, [navigate]);

  const handleCategoryManage = useCallback(() => {
    optimizeWebViewTransition(() => {
      navigate('/category-manage');
    });
  }, [navigate]);

  const handleMenuManage = useCallback(() => {
    optimizeWebViewTransition(() => {
      navigate('/menu-manage');
    });
  }, [navigate]);

  const handleStoreMenuManage = useCallback((store: Store) => {
    optimizeWebViewTransition(() => {
      setCurrentStore(store);
      navigate('/menu-manage');
    });
  }, [navigate, setCurrentStore]);

  const handleStoreCategoryManage = useCallback((store: Store) => {
    optimizeWebViewTransition(() => {
      setCurrentStore(store);
      navigate('/category-manage');
    });
  }, [navigate, setCurrentStore]);

  // 메뉴 아이템들을 useMemo로 최적화
  const menuItems = useMemo(() => [
    {
      title: '매장 등록',
      description: '새로운 매장을 등록하세요',
      icon: <Add sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'primary.main' }} />,
      color: 'primary.main',
      onClick: handleAddStore,
    },
    {
      title: '카테고리 관리',
      description: '메뉴 카테고리를 관리하세요',
      icon: <MenuBook sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'secondary.main' }} />,
      color: 'secondary.main',
      onClick: handleCategoryManage,
    },
    {
      title: '메뉴 관리',
      description: '메뉴 아이템을 관리하세요',
      icon: <Receipt sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'warning.main' }} />,
      color: 'warning.main',
      onClick: handleMenuManage,
    },
    {
      title: '주문 관리',
      description: '실시간 주문을 확인하세요',
      icon: <TrendingUp sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'success.main' }} />,
      color: 'success.main',
      onClick: () => { }, // 추후 구현
    },
  ], [handleAddStore, handleCategoryManage, handleMenuManage]);

  // 표시할 매장 목록을 useMemo로 최적화
  const displayStores = useMemo(() => {
    return stores.slice(0, 2);
  }, [stores]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 헤더 */}
      <AppHeader
        title="🏪 매장관리자 대시보드"
        onLogout={handleLogout}
      />

      {/* 메인 콘텐츠 */}
      <Container maxWidth="lg" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
        {/* 환영 메시지 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mb: UI_CONSTANTS.SPACING.LG, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            안녕하세요, {user?.name}님! 🏪
          </Typography>
          <Typography variant="body1" color="text.secondary">
            오늘도 매장을 성공적으로 운영해보세요.
          </Typography>
        </Paper>

        {/* 매장 목록 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mb: UI_CONSTANTS.SPACING.LG }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: UI_CONSTANTS.SPACING.MD }}>
            <Typography variant="h6">
              내 매장 ({stores.length})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleStoresList}
              startIcon={<Edit />}
            >
              전체 보기
            </Button>
          </Box>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />

          {stores.length === 0 ? (
            <EmptyState
              icon="🏪"
              title="등록된 매장이 없습니다"
              description="첫 번째 매장을 등록하여 시작해보세요"
              actionLabel="매장 등록하기"
              onAction={handleAddStore}
            />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.TABLET, gap: UI_CONSTANTS.SPACING.MD }}>
              {displayStores.map((store) => (
                <Card key={store.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: UI_CONSTANTS.SPACING.SM }}>
                      <Typography variant="h6" component="h3">
                        {store.name}
                      </Typography>
                      <Chip
                        label={store.isOpen ? '운영중' : '휴무'}
                        color={store.isOpen ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {store.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📍 {store.address}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MenuBook />}
                        onClick={() => handleStoreCategoryManage(store)}
                        color="secondary"
                      >
                        카테고리
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Receipt />}
                        onClick={() => handleStoreMenuManage(store)}
                        sx={{
                          background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                        }}
                      >
                        메뉴 관리
                      </Button>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      color="inherit"
                      onClick={() => {
                        optimizeWebViewTransition(() => {
                          navigate(`/store-edit/${store.id}`);
                        });
                      }}
                    >
                      수정
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* 빠른 액션 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mb: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            빠른 액션
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.DESKTOP_4COL, gap: UI_CONSTANTS.SPACING.MD }}>
            {menuItems.map((item, index) => (
              <Card
                key={index}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
                onClick={item.onClick}
              >
                <CardContent sx={{ textAlign: 'center', p: UI_CONSTANTS.SPACING.MD }}>
                  <Box sx={{ mb: UI_CONSTANTS.SPACING.SM }}>
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle1" component="h3" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* 통계 요약 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            오늘의 요약
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.DESKTOP, gap: UI_CONSTANTS.SPACING.MD }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                오늘 주문
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                ₩0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                오늘 매출
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stores.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                운영 매장
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default StoreOwnerDashboard; 