import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    IconButton,
    Alert,
    Divider,
    Stack,
    AppBar,
    Toolbar,
    Container,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useStoreStore } from '../../stores/storeStore';
import { getCurrentLocation, calculateDistance, formatDistance } from '../../utils/locationHelper';
import { googleMapsConfig } from '../../config/firebase';
import { optimizeWebViewTransition, optimizeWebViewDataLoading, optimizeWebViewListRendering } from '../../utils/webviewHelper';
import type { Store, StoreWithDistance, Location } from '../../types/store';

// 매장 카드 컴포넌트
interface StoreCardProps {
    store: StoreWithDistance;
    onSelect: (store: Store) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect }) => {
    return (
        <Card
            sx={{
                mb: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {store.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                            size="small"
                            color={store.isOpen ? 'success' : 'error'}
                            label={store.isOpen ? '영업중' : '영업종료'}
                        />
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {store.description}
                </Typography>

                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {store.address}
                        </Typography>
                        {store.distance && (
                            <Chip
                                size="small"
                                label={formatDistance(store.distance)}
                                variant="outlined"
                                color="primary"
                            />
                        )}
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

                {store.categories && store.categories.length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                메뉴:
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
                                    label={`+${store.categories.length - 3}개`}
                                    variant="outlined"
                                    color="primary"
                                />
                            )}
                        </Box>
                    </>
                )}
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onSelect(store)}
                    disabled={!store.isOpen}
                >
                    {store.isOpen ? '메뉴 보기' : '영업종료'}
                </Button>
            </CardActions>
        </Card>
    );
};

const CustomerStoreListScreen: React.FC = () => {
    const navigate = useNavigate();
    const { stores, isLoading, error, fetchAllStores } = useStoreStore();

    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(true);
    const [storeListReady, setStoreListReady] = useState(false);

    // WebView 렌더링 최적화
    useEffect(() => {
        optimizeWebViewTransition();
    }, []);

    // 현재 위치 가져오기
    useEffect(() => {
        const getLocation = async () => {
            try {
                setIsLocationLoading(true);
                const location = await getCurrentLocation();
                setUserLocation(location);
                setLocationError(null);
            } catch (error: any) {
                setLocationError(error.message);
                console.warn('위치 가져오기 실패, 테스트 모드로 진행:', error);
                setUserLocation({ latitude: 37.5665, longitude: 126.9780 });
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

    // 거리가 포함된 매장 목록 계산 (실제 거리 계산 사용)
    const storesWithDistance: StoreWithDistance[] = (() => {
        if (!userLocation || !stores.length) {
            return stores;
        }

        // 위치 정보가 있는 매장들만 필터링하고 거리 계산
        const storesWithLocation = stores.filter(store =>
            store.latitude && store.longitude
        );

        if (storesWithLocation.length === 0) {
            return stores;
        }

        // 실제 거리 계산
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
        if (storesWithDistance.length > 0 && !storeListReady && !isLoading) {
            optimizeWebViewListRendering('[data-testid="store-list-container"]', () => {
                setStoreListReady(true);
            });
        }
    }, [storesWithDistance.length, storeListReady, isLoading]);

    const handleStoreSelect = (store: Store) => {
        optimizeWebViewTransition();
        navigate(`/store/${store.id}/menu`);
    };

    const handleBack = () => {
        optimizeWebViewTransition();
        navigate('/dashboard');
    };

    if (isLocationLoading) {
        return <LoadingSpinner message="위치 정보를 가져오는 중..." />;
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleBack}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        매장 찾기
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 2 }}>
                {locationError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        위치 정보를 가져올 수 없어 테스트 모드로 실행됩니다.
                    </Alert>
                )}

                {userLocation && (
                    <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
                        <CardContent sx={{ pb: '16px !important' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="primary" />
                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                                    현재 위치에서 가까운 순으로 표시됩니다
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
                            {!googleMapsConfig.apiKey && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    ⚠️ Google Maps API 키가 설정되지 않아 테스트 모드로 실행됩니다
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {isLoading && <LoadingSpinner message="매장 목록을 가져오는 중..." />}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!isLoading && !error && (
                    <>
                        {storesWithDistance.length === 0 ? (
                            <EmptyState
                                icon={<LocationOnIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                                title="등록된 매장이 없습니다"
                                description="아직 등록된 매장이 없어요. 잠시만 기다려주세요!"
                            />
                        ) : (
                            <Box
                                data-testid="store-list-container"
                                sx={{
                                    opacity: storeListReady ? 1 : 0.7,
                                    transition: 'opacity 0.2s ease-in-out',
                                    transform: 'translateZ(0)',
                                    willChange: 'opacity'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    전체 {storesWithDistance.length}개 매장
                                </Typography>

                                {storesWithDistance.map((store) => (
                                    <StoreCard
                                        key={store.id}
                                        store={store}
                                        onSelect={handleStoreSelect}
                                    />
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default CustomerStoreListScreen; 