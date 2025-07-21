import React, { useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
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
import DashboardHeader from '../common/DashboardHeader';
import EmptyState from '../common/EmptyState';
import { UI_CONSTANTS, APP_CONFIG } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';

const StoreOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { stores, fetchStores } = useStoreStore();

  useEffect(() => {
    if (user) {
      fetchStores(user.id);
    }

    // 대시보드 렌더링 최적화
    optimizeWebViewTransition(() => {
      console.log('매장 대시보드 렌더링 최적화 완료');
    });
  }, [user, fetchStores]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('로그아웃 버튼 클릭됨');

      // 로컬 상태 즉시 클리어 (웹뷰에서 가장 안전한 방법)
      localStorage.clear();
      sessionStorage.clear();

      // Firebase 로그아웃 시도 (실패해도 무시)
      try {
        await logout();
        console.log('Firebase 로그아웃 완료');
      } catch (logoutError) {
        console.warn('Firebase 로그아웃 실패 (무시됨):', logoutError);
      }

      // 페이지 새로고침으로 완전히 초기화
      console.log('페이지 새로고침 중...');
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

  // 메뉴 아이템들을 useMemo로 최적화
  const menuItems = useMemo(() => [
    {
      title: '매장 등록',
      description: '새로운 매장을 등록하세요',
      icon: <Add sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'primary.main' }} />,
      color: 'primary.main',
      path: '/store/register',
    },
    {
      title: '메뉴 관리',
      description: '카테고리와 메뉴를 관리하세요',
      icon: <MenuBook sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'secondary.main' }} />,
      color: 'secondary.main',
      path: '/store/menu',
    },
    {
      title: '주문 관리',
      description: '실시간 주문을 확인하세요',
      icon: <Receipt sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'success.main' }} />,
      color: 'success.main',
      path: '/store/orders',
    },
    {
      title: '통계',
      description: '매장 성과를 확인하세요',
      icon: <TrendingUp sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'info.main' }} />,
      color: 'info.main',
      path: '/store/stats',
    },
  ], []);

  // 표시할 매장 목록을 useMemo로 최적화
  const displayStores = useMemo(() => {
    return stores.slice(0, 2);
  }, [stores]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 헤더 */}
      <DashboardHeader
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
            <Typography variant="h6" component="h3">
              내 매장 목록
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={handleAddStore}
            >
              새 매장 등록
            </Button>
          </Box>

          {stores.length === 0 ? (
            <EmptyState
              icon={<Add />}
              title="등록된 매장이 없습니다"
              description="첫 번째 매장을 등록해보세요"
              actionLabel="매장 등록"
              onAction={handleAddStore}
            />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.TABLET, gap: UI_CONSTANTS.SPACING.MD }}>
              {displayStores.map((store) => (
                <Card key={store.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: UI_CONSTANTS.SPACING.SM }}>
                      <Box>
                        <Typography variant="h6" component="h4" gutterBottom>
                          {store.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {store.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={store.isOpen ? '영업중' : '휴무'}
                        color={store.isOpen ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: UI_CONSTANTS.SPACING.SM, mb: UI_CONSTANTS.SPACING.SM }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          카테고리
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {store.categories.length}개
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          전화번호
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {store.phone}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<Edit />}>
                        수정
                      </Button>
                      <Button size="small" startIcon={<MenuBook />}>
                        메뉴 관리
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {stores.length > 2 && (
            <Box sx={{ textAlign: 'center', mt: UI_CONSTANTS.SPACING.MD }}>
              <Button
                variant="outlined"
                onClick={handleStoresList}
                size="large"
              >
                모든 매장 보기 ({stores.length}개)
              </Button>
            </Box>
          )}
        </Paper>

        {/* 빠른 액션 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.DESKTOP_4COL, gap: UI_CONSTANTS.SPACING.MD }}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: UI_CONSTANTS.SPACING.MD }}>
                <Box sx={{ mb: UI_CONSTANTS.SPACING.SM }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* 통계 요약 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mt: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            📊 오늘의 통계
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.DESKTOP, gap: UI_CONSTANTS.SPACING.MD }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                23
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 주문 건수
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                214,000원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 매출
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                운영 중인 매장
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default StoreOwnerDashboard; 