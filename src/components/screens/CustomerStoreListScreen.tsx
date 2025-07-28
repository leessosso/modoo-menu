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
import { optimizeWebViewTransition, optimizeWebViewDataLoading } from '../../utils/webviewHelper';
import type { Store } from '../../types/store';

// 거리 정보가 포함된 매장 타입
interface StoreWithDistance extends Store {
    distance?: number;
}

// 거리 계산 함수 (haversine formula) - 향후 실제 위치 기반 거리 계산에 사용 예정
// const calculateDistance = (
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
// ): number => {
//     const R = 6371; // 지구 반지름 (km)
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c;
//     return Math.round(distance * 10) / 10; // 소수점 1자리까지
// };

// 현재 위치 가져오기 함수
const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('위치 서비스가 지원되지 않습니다.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error) => {
                console.warn('위치 가져오기 실패:', error);
                // 테스트용 기본 위치 (서울 중심부)
                resolve({ lat: 37.5665, lon: 126.9780 });
            },
            {
                timeout: 10000,
                maximumAge: 5 * 60 * 1000, // 5분
            }
        );
    });
};

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
                    {/* 주소 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {store.address}
                        </Typography>
                        {store.distance && (
                            <Chip
                                size="small"
                                label={`${store.distance}km`}
                                variant="outlined"
                                color="primary"
                            />
                        )}
                    </Box>

                    {/* 전화번호 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {store.phone}
                        </Typography>
                    </Box>

                    {/* 영업시간 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {store.businessHours}
                        </Typography>
                    </Box>
                </Stack>

                {/* 카테고리 */}
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

    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(true);

    // WebView 렌더링 최적화
    useEffect(() => {
        optimizeWebViewTransition();
    }, []);

    // 컴포넌트 마운트 시 현재 위치 가져오기 (WebView 최적화 적용)
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
                // 테스트용 기본 위치 설정
                setUserLocation({ lat: 37.5665, lon: 126.9780 });
            } finally {
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

    // 거리가 포함된 매장 목록 계산 (WebView 즉시 응답성을 위해 useMemo 제거)
    console.log('🏪 CustomerStoreList - stores 상태:', { 
        storesLength: stores.length, 
        userLocation: userLocation ? 'available' : 'null',
        stores: stores.map(s => ({ id: s.id, name: s.name }))
    });

    const storesWithDistance: StoreWithDistance[] = (() => {
        if (!userLocation || !stores.length) {
            console.log('🏪 CustomerStoreList - 조건 불충족:', { userLocation: !!userLocation, storesLength: stores.length });
            return stores;
        }

        const result = stores.map((store): StoreWithDistance => ({
            ...store,
            // 테스트를 위해 임시로 랜덤 거리 생성 (실제로는 store.location 사용)
            distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        console.log('🏪 CustomerStoreList - storesWithDistance 계산 완료:', { count: result.length, stores: result.map(s => ({ name: s.name, distance: s.distance })) });
        return result;
    })();

    const handleStoreSelect = (store: Store) => {
        console.log('매장 선택:', store);
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
            {/* 헤더 */}
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
                {/* 위치 정보 */}
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
                        </CardContent>
                    </Card>
                )}

                {/* 로딩 상태 */}
                {isLoading && <LoadingSpinner message="매장 목록을 가져오는 중..." />}

                {/* 에러 상태 */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* 매장 목록 */}
                {!isLoading && !error && (
                    <>
                        {storesWithDistance.length === 0 ? (
                            <EmptyState
                                icon={<LocationOnIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                                title="등록된 매장이 없습니다"
                                description="아직 등록된 매장이 없어요. 잠시만 기다려주세요!"
                            />
                        ) : (
                            <>
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
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default CustomerStoreListScreen; 