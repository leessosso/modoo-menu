import React, { useEffect, useState } from 'react';
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
import AppHeader from '../common/AppHeader';
import { useStoreStore } from '../../stores/storeStore';
import { getCurrentLocation, calculateDistance, formatDistance } from '../../utils/locationHelper';
import { checkFlutterLocationPermission, getFlutterLocation, optimizeWebViewTransition, optimizeWebViewDataLoading, optimizeWebViewListRendering } from '../../utils/webviewHelper';

import type { Store, StoreWithDistance, Location } from '../../types/store';

const CustomerStoreListScreen: React.FC = () => {
    const navigate = useNavigate();
    const { stores, fetchAllStores } = useStoreStore();

    // 상태 관리
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(true);
    const [storeListReady, setStoreListReady] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

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
                        setLocationError(null);
                        console.log('📍 Flutter에서 전달받은 위치:', flutterLocation);
                        return;
                    }
                }

                // Flutter 위치 정보가 없으면 브라우저 GPS 사용
                const location = await getCurrentLocation();
                setUserLocation(location);
                setLocationError(null);
                console.log('📍 브라우저 GPS 위치 설정됨:', location);
            } catch (error: any) {
                setLocationError(error.message);
                console.warn('위치 가져오기 실패:', error);
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

    // 거리가 포함된 매장 목록 계산
    const storesWithDistance: StoreWithDistance[] = (() => {
        if (!userLocation || !stores.length) {
            return stores;
        }

        const storesWithLocation = stores.filter(store =>
            store.latitude && store.longitude
        );

        if (storesWithLocation.length === 0) {
            return stores;
        }

        const result = storesWithLocation.map((store): StoreWithDistance => ({
            ...store,
            distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                store.latitude!,
                store.longitude!
            ),
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        return result;
    })();

    // 위치 정보가 없는 매장 수 계산
    const storesWithoutLocation = stores.filter(store =>
        !store.latitude || !store.longitude
    ).length;

    // 매장 리스트 렌더링 최적화
    useEffect(() => {
        if (storesWithDistance.length > 0 && !storeListReady) {
            optimizeWebViewListRendering('[data-testid="store-list-container"]', () => {
                setStoreListReady(true);
            });
        }
    }, [storesWithDistance.length, storeListReady]);

    const handleStoreSelect = (store: Store) => {
        optimizeWebViewTransition();
        navigate(`/store/${store.id}/menu`);
    };

    const handleBackClick = () => {
        optimizeWebViewTransition();
        navigate('/dashboard');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppHeader title="🏪 매장 목록" onBackClick={handleBackClick} />

            <Box sx={{ pt: 8, p: 2 }}>
                {/* 위치 정보 */}
                {userLocation && (
                    <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
                        <CardContent sx={{ pb: '16px !important' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                                    📍 현재 위치에서 가까운 순으로 표시됩니다
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                위치: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                            </Typography>
                            {storesWithoutLocation > 0 && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    📍 위치 정보가 없는 매장 {storesWithoutLocation}개가 거리순 정렬에서 제외됩니다
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* 위치 로딩 */}
                {isLocationLoading && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            위치 정보를 가져오는 중...
                        </Typography>
                    </Box>
                )}

                {/* 위치 에러 */}
                {locationError && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                            �� 위치 정보를 가져올 수 없습니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {locationError}
                        </Typography>
                    </Alert>
                )}

                {/* 매장 목록 */}
                <Box data-testid="store-list-container">
                    {storesWithDistance.map((store) => (
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" gutterBottom>
                                            {store.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {store.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            📍 {store.address}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            📞 {store.phone}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            🕒 {store.businessHours}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                        <Chip
                                            size="small"
                                            color={store.isOpen ? 'success' : 'error'}
                                            label={store.isOpen ? '영업중' : '영업종료'}
                                        />
                                        {store.distance && (
                                            <Chip
                                                size="small"
                                                label={formatDistance(store.distance)}
                                                variant="outlined"
                                                color="primary"
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {store.categories && store.categories.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                            카테고리:
                                        </Typography>
                                        {store.categories.slice(0, 3).map((category) => (
                                            <Chip
                                                key={category.id}
                                                size="small"
                                                label={`${category.icon} ${category.name}`}
                                                variant="outlined"
                                            />
                                        ))}
                                        {store.categories.length > 3 && (
                                            <Chip
                                                size="small"
                                                label={`+${store.categories.length - 3}`}
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                )}
                            </CardContent>

                            <Box sx={{ px: 2, pb: 2 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={!store.isOpen}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStoreSelect(store);
                                    }}
                                >
                                    {store.isOpen ? '메뉴 보기' : '영업종료'}
                                </Button>
                            </Box>
                        </Card>
                    ))}
                </Box>

                {/* 매장이 없을 때 */}
                {storesWithDistance.length === 0 && !isLocationLoading && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            등록된 매장이 없습니다
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default CustomerStoreListScreen; 