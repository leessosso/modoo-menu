import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
} from '@mui/material';
import {
  Restaurant,
  QrCode,
  History,
  Favorite,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import DashboardHeader from '../common/DashboardHeader';
import { UI_CONSTANTS, APP_CONFIG } from '../../constants';
import { optimizeWebViewTransition, optimizeWebViewDataLoading } from '../../utils/webviewHelper';
import type { Store } from '../../types/store';

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { stores, fetchAllStores } = useStoreStore();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // WebView 렌더링 최적화
  useEffect(() => {
    optimizeWebViewTransition();
  }, []);

  // 현재 위치 가져오기 (WebView 최적화 적용)
  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLocationLoading(true);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              });
              setIsLocationLoading(false);
            },
            () => {
              // 위치 권한 거부 시 테스트용 위치 사용
              setUserLocation({ lat: 37.5665, lon: 126.9780 });
              setIsLocationLoading(false);
            },
            { timeout: 10000 }
          );
        } else {
          setUserLocation({ lat: 37.5665, lon: 126.9780 });
          setIsLocationLoading(false);
        }
      } catch (error) {
        setUserLocation({ lat: 37.5665, lon: 126.9780 });
        setIsLocationLoading(false);
      }
    };

    optimizeWebViewDataLoading(() => {
      getLocation();
    }, 50); // 위치 정보는 더 빨리 로드
  }, []);

  // 매장 목록 가져오기 (WebView 최적화 적용)
  useEffect(() => {
    optimizeWebViewDataLoading(() => {
      fetchAllStores();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 가까운 매장 3개 계산 (WebView 즉시 응답성을 위해 useMemo 제거)
  console.log('🏪 Dashboard - stores 상태:', { 
    storesLength: stores.length, 
    userLocation: userLocation ? 'available' : 'null',
    stores: stores.map(s => ({ id: s.id, name: s.name }))
  });

  const nearbyStores = (() => {
    if (!userLocation || !stores.length) {
      console.log('🏪 Dashboard - 조건 불충족:', { userLocation: !!userLocation, storesLength: stores.length });
      return [];
    }

    const result = stores
      .map((store) => ({
        ...store,
        // 테스트용 랜덤 거리 생성
        distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 3);

    console.log('🏪 Dashboard - nearbyStores 계산 완료:', { count: result.length, stores: result.map(s => ({ name: s.name, distance: s.distance })) });
    return result;
  })();

  // 매장 리스트로 이동
  const handleStoreListClick = () => {
    optimizeWebViewTransition();
    navigate('/stores');
  };

  // QR코드 스캔 기능 (TODO)
  const handleQRScanClick = () => {
    alert('QR코드 스캔 기능은 곧 개발될 예정입니다!');
  };

  // 주문 내역 기능 (TODO)
  const handleOrderHistoryClick = () => {
    alert('주문 내역 기능은 곧 개발될 예정입니다!');
  };

  // 즐겨찾기 기능 (TODO)
  const handleFavoritesClick = () => {
    alert('즐겨찾기 기능은 곧 개발될 예정입니다!');
  };

  // 매장 선택
  const handleStoreSelect = (store: Store) => {
    console.log('매장 선택:', store);
    optimizeWebViewTransition();
    navigate(`/store/${store.id}/menu`);
  };

  // 메뉴 아이템들을 useMemo로 최적화
  const menuItems = useMemo(() => [
    {
      title: 'QR코드 스캔',
      description: '매장의 QR코드를 스캔하여 바로 주문하세요',
      icon: <QrCode sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'primary.main' }} />,
      color: 'primary.main',
      onClick: handleQRScanClick,
    },
    {
      title: '매장 선택',
      description: '원하는 매장을 선택하여 메뉴를 확인하세요',
      icon: <Restaurant sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'primary.main' }} />,
      color: 'primary.main',
      onClick: handleStoreListClick,
    },
    {
      title: '주문 내역',
      description: '이전 주문 내역을 확인하세요',
      icon: <History sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'secondary.main' }} />,
      color: 'secondary.main',
      onClick: handleOrderHistoryClick,
    },
    {
      title: '즐겨찾기',
      description: '자주 방문하는 매장을 즐겨찾기에 추가하세요',
      icon: <Favorite sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'error.main' }} />,
      color: 'error.main',
      onClick: handleFavoritesClick,
    },
  ], [handleQRScanClick, handleStoreListClick, handleOrderHistoryClick, handleFavoritesClick]);

  // 사용자 생성일을 useMemo로 최적화
  const userCreatedDate = useMemo(() => {
    return user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-';
  }, [user?.createdAt]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 헤더 */}
      <DashboardHeader
        title={`🍽️ ${APP_CONFIG.NAME}`}
        maxWidth="md"
      />

      {/* 메인 콘텐츠 */}
      <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
        {/* 환영 메시지 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mb: UI_CONSTANTS.SPACING.LG, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            안녕하세요, {user?.name}님! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            오늘은 어떤 매장에서 주문하실 건가요?
          </Typography>
        </Paper>

        {/* 가까운 매장 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mb: UI_CONSTANTS.SPACING.LG }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: UI_CONSTANTS.SPACING.MD }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
              🏪 가까운 매장
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handleStoreListClick}
              sx={{ color: 'primary.main' }}
            >
              전체 보기
            </Button>
          </Box>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />

          {isLocationLoading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                위치 정보를 가져오는 중...
              </Typography>
            </Box>
          ) : nearbyStores.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                주변에 등록된 매장이 없습니다
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nearbyStores.map((store) => (
                <Card
                  key={store.id}
                  onClick={() => handleStoreSelect(store)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
                        {store.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          size="small"
                          color={store.isOpen ? 'success' : 'error'}
                          label={store.isOpen ? '영업중' : '영업종료'}
                        />
                        <Chip
                          size="small"
                          label={`${store.distance}km`}
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {store.description}
                    </Typography>

                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {store.address}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {store.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {store.businessHours}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* 메뉴 그리드 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.TABLET, gap: UI_CONSTANTS.SPACING.MD }}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              onClick={item.onClick}
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

        {/* 빠른 액션 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mt: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            빠른 주문
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'flex', gap: UI_CONSTANTS.SPACING.SM, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<QrCode />}
              onClick={handleQRScanClick}
              sx={{ flex: 1, minWidth: 200 }}
            >
              QR코드 스캔
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Restaurant />}
              onClick={handleStoreListClick}
              sx={{ flex: 1, minWidth: 200 }}
            >
              매장 선택
            </Button>
          </Box>
        </Paper>

        {/* 사용자 정보 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mt: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            내 정보
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.TABLET, gap: UI_CONSTANTS.SPACING.SM }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                이름
              </Typography>
              <Typography variant="body1">
                {user?.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                이메일
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
            {user?.phone && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  전화번호
                </Typography>
                <Typography variant="body1">
                  {user.phone}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">
                가입일
              </Typography>
              <Typography variant="body1">
                {userCreatedDate}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardScreen; 