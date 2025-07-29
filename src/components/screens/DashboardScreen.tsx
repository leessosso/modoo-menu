import React, { useMemo, useEffect, useState, useCallback } from 'react';
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
  Alert,
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
import { getCurrentLocation, calculateDistance, formatDistance, checkLocationPermission } from '../../utils/locationHelper';
import { optimizeWebViewTransition, optimizeWebViewDataLoading, optimizeWebViewListRendering } from '../../utils/webviewHelper';
import type { Store, StoreWithDistance, Location } from '../../types/store';

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { stores, fetchAllStores } = useStoreStore();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [nearbyStoresReady, setNearbyStoresReady] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // WebView 렌더링 최적화
  useEffect(() => {
    optimizeWebViewTransition();
  }, []);

  // 위치 권한 상태 확인
  useEffect(() => {
    const checkPermission = async () => {
      const status = await checkLocationPermission();
      setPermissionStatus(status);
      console.log('📍 위치 권한 상태:', status);
    };
    checkPermission();
  }, []);

  // 현재 위치 가져오기
  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLocationLoading(true);
        const location = await getCurrentLocation();
        setUserLocation(location);
        setPermissionStatus('granted');
        console.log('📍 실제 GPS 위치 설정됨:', location);
      } catch (error) {
        console.warn('위치 가져오기 실패:', error);
        setLocationError('위치 권한이 필요합니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
        setPermissionStatus('denied');
        // 실제 GPS 실패 시 기본 위치 사용하지 않음
        setUserLocation(null);
      } finally {
        setIsLocationLoading(false);
      }
    };

    optimizeWebViewDataLoading(() => {
      getLocation();
    }, 50);
  }, []);

  // 매장 목록 가져오기
  useEffect(() => {
    optimizeWebViewDataLoading(() => {
      fetchAllStores();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 가까운 매장 3개 계산 (실제 거리 계산 사용)
  const nearbyStores: StoreWithDistance[] = (() => {
    if (!userLocation || !stores.length) {
      return [];
    }

    // 위치 정보가 있는 매장들만 필터링하고 거리 계산
    const storesWithLocation = stores.filter(store =>
      store.latitude && store.longitude
    );

    if (storesWithLocation.length === 0) {
      return [];
    }

    // 실제 거리 계산
    const result = storesWithLocation
      .map((store): StoreWithDistance => ({
        ...store,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.latitude!,
          store.longitude!
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 3);

    return result;
  })();

  // 매장 리스트 렌더링 최적화
  useEffect(() => {
    if (nearbyStores.length > 0 && !nearbyStoresReady) {
      optimizeWebViewListRendering('[data-testid="nearby-stores-container"]', () => {
        setNearbyStoresReady(true);
      });
    }
  }, [nearbyStores.length, nearbyStoresReady]);

  // 이벤트 핸들러들
  const handleStoreListClick = () => {
    optimizeWebViewTransition();
    navigate('/stores');
  };

  const handleQRScanClick = () => {
    alert('QR코드 스캔 기능은 곧 개발될 예정입니다!');
  };

  const handleOrderHistoryClick = () => {
    alert('주문 내역 기능은 곧 개발될 예정입니다!');
  };

  const handleFavoritesClick = () => {
    alert('즐겨찾기 기능은 곧 개발될 예정입니다!');
  };

  const handleStoreSelect = (store: Store) => {
    optimizeWebViewTransition();
    navigate(`/store/${store.id}/menu`);
  };

  // 메뉴 아이템들
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

  const userCreatedDate = useMemo(() => {
    return user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-';
  }, [user?.createdAt]);

  // 위치 권한 재설정 함수
  const handleResetLocationPermission = useCallback(async () => {
    try {
      setIsLocationLoading(true);
      setLocationError(null);

      // 권한 상태 다시 확인
      const status = await checkLocationPermission();
      console.log('📍 권한 재확인:', status);

      if (status === 'denied') {
        setLocationError('위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
        return;
      }

      // 위치 다시 가져오기 시도
      const location = await getCurrentLocation();
      setUserLocation(location);
      setPermissionStatus('granted');
      console.log('📍 위치 권한 재설정 성공:', location);

    } catch (error) {
      console.warn('위치 권한 재설정 실패:', error);
      setLocationError('위치 권한을 다시 허용해주세요.');
      setPermissionStatus('denied');
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardHeader
        title={`🍽️ ${APP_CONFIG.NAME}`}
        maxWidth="md"
      />

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

          {locationError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                📍 위치 권한이 필요합니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                가까운 매장을 찾으려면 브라우저 설정에서 위치 권한을 허용해주세요.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                현재 권한 상태: {permissionStatus === 'granted' ? '허용됨' : permissionStatus === 'denied' ? '거부됨' : '요청 대기 중'}
              </Typography>

              {/* 권한 설정 가이드 */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  📱 권한 설정 방법:
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  <strong>iOS:</strong> 설정 → Safari → 위치 서비스 → 이 웹사이트 → 허용
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  <strong>Android:</strong> 설정 → 개인정보 보호 → 위치 → Chrome → 허용
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <strong>데스크톱:</strong> 주소창 🔒 아이콘 → 위치 → 허용
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={handleResetLocationPermission}
                sx={{ mt: UI_CONSTANTS.SPACING.SM }}
              >
                위치 권한 재설정
              </Button>
            </Alert>
          )}

          {isLocationLoading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                위치 정보를 가져오는 중...
              </Typography>
            </Box>
          ) : nearbyStores.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {locationError ? "위치 권한을 허용하면 가까운 매장을 찾을 수 있습니다." : "주변에 등록된 매장이 없습니다"}
              </Typography>
            </Box>
          ) : (
            <Box
              data-testid="nearby-stores-container"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                opacity: nearbyStoresReady ? 1 : 0.7,
                transition: 'opacity 0.2s ease-in-out',
                transform: 'translateZ(0)',
                willChange: 'opacity'
              }}
            >
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
                    '&:active': {
                      transform: 'translateY(0px)',
                      boxShadow: 1,
                    }
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
                          label={formatDistance(store.distance || 0)}
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