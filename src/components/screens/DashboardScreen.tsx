import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import { APP_CONFIG } from '../../constants';
import { getCurrentLocation, calculateDistance, formatDistance } from '../../utils/locationHelper';
import { checkFlutterLocationPermission, getFlutterLocation, optimizeWebViewTransition, optimizeWebViewDataLoading, optimizeWebViewListRendering } from '../../utils/webviewHelper';
import type { Store, StoreWithDistance, Location } from '../../types/store';

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { stores, fetchAllStores } = useStoreStore();

  // 상태 관리
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [nearbyStoresReady, setNearbyStoresReady] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // 위치 권한 상태 확인
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await checkFlutterLocationPermission();
        setPermissionStatus(status ? 'granted' : 'denied');
        console.log('📍 위치 권한 상태:', status ? 'granted' : 'denied');
      } catch (error) {
        console.warn('권한 상태 확인 실패:', error);
        setPermissionStatus('prompt');
      }
    };
    checkPermission();
  }, []);

  // 현재 위치 가져오기
  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLocationLoading(true);

        // Flutter에서 전달받은 위치 정보 확인
        const flutterPermission = await checkFlutterLocationPermission();
        if (flutterPermission) {
          console.log('📍 Flutter에서 위치 권한이 허용되었습니다.');
          const flutterLocation = await getFlutterLocation();
          if (flutterLocation) {
            setUserLocation(flutterLocation);
            setPermissionStatus('granted');
            console.log('📍 Flutter에서 전달받은 위치:', flutterLocation);
            return;
          }
        }

        // Flutter 위치 정보가 없으면 브라우저 GPS 사용
        const location = await getCurrentLocation();
        setUserLocation(location);
        setPermissionStatus('granted');
        console.log('📍 브라우저 GPS 위치 설정됨:', location);
      } catch (error) {
        console.warn('위치 가져오기 실패:', error);
        setLocationError('위치 권한이 필요합니다.');
        setPermissionStatus('denied');
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

  // 가까운 매장 3개 계산
  const nearbyStores: StoreWithDistance[] = (() => {
    if (!userLocation || !stores.length) {
      return [];
    }

    const storesWithLocation = stores.filter(store =>
      store.latitude && store.longitude
    );

    if (storesWithLocation.length === 0) {
      return [];
    }

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
    optimizeWebViewTransition();
    navigate('/qr-scan');
  };

  const handleOrderHistoryClick = () => {
    optimizeWebViewTransition();
    navigate('/order-history');
  };

  const handleFavoritesClick = () => {
    optimizeWebViewTransition();
    navigate('/favorites');
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
      icon: '📱',
      color: 'primary.main',
      onClick: handleQRScanClick,
    },
    {
      title: '매장 선택',
      description: '원하는 매장을 선택하여 메뉴를 확인하세요',
      icon: '🏪',
      color: 'primary.main',
      onClick: handleStoreListClick,
    },
    {
      title: '주문 내역',
      description: '이전 주문 내역을 확인하세요',
      icon: '📋',
      color: 'secondary.main',
      onClick: handleOrderHistoryClick,
    },
    {
      title: '즐겨찾기',
      description: '자주 방문하는 매장을 즐겨찾기에 추가하세요',
      icon: '⭐',
      color: 'error.main',
      onClick: handleFavoritesClick,
    },
  ], [handleQRScanClick, handleStoreListClick, handleOrderHistoryClick, handleFavoritesClick]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      {/* 헤더 */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          🍽️ {APP_CONFIG.NAME}
        </Typography>
        <Typography variant="h6" gutterBottom>
          안녕하세요, {user?.name}님! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          오늘은 어떤 매장에서 주문하실 건가요?
        </Typography>
      </Box>

      {/* 가까운 매장 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
            <Box data-testid="nearby-stores-container">
              {nearbyStores.map((store) => (
                <Card
                  key={store.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleStoreSelect(store)}
                >
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                          {store.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {store.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📍 {store.address}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={formatDistance(store.distance || 0)}
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 메뉴 그리드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
        {menuItems.map((item, index) => (
          <Card
            key={index}
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={item.onClick}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {item.icon}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardScreen; 