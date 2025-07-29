import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
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
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    AccessTime as AccessTimeIcon,
    RestaurantMenu as MenuIcon,
    Star as StarIcon,
    VisibilityOff as HiddenIcon,
    AttachMoney as PriceIcon,
    ShoppingCart as CartIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import AppHeader from '../common/AppHeader';
import { useStoreStore } from '../../stores/storeStore';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import type { Store, MenuItem } from '../../types/store';

// 매장 정보 카드 컴포넌트
interface StoreInfoCardProps {
    store: Store;
}

const StoreInfoCard: React.FC<StoreInfoCardProps> = ({ store }) => {
    return (
        <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
            <CardContent>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                    {store.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {store.description}
                </Typography>

                <Stack spacing={1}>
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

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Chip
                        size="small"
                        color={store.isOpen ? 'success' : 'error'}
                        label={store.isOpen ? '영업중' : '영업종료'}
                    />
                    <Chip
                        size="small"
                        variant="outlined"
                        label={`${store.categories?.length || 0}개 카테고리`}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

// 메뉴 아이템 카드 컴포넌트
interface MenuItemCardProps {
    menuItem: MenuItem;
    onAddToCart: (menuItem: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ menuItem, onAddToCart }) => {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                },
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {menuItem.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {menuItem.isPopular && (
                            <StarIcon color="warning" fontSize="small" />
                        )}
                        {!menuItem.isAvailable && (
                            <HiddenIcon color="disabled" fontSize="small" />
                        )}
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {menuItem.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PriceIcon fontSize="small" color="primary" />
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {menuItem.price.toLocaleString()}원
                    </Typography>
                </Box>

                {menuItem.allergens && menuItem.allergens.length > 0 && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                알레르기:
                            </Typography>
                            {menuItem.allergens.map((allergen) => (
                                <Chip
                                    key={allergen}
                                    size="small"
                                    label={allergen}
                                    variant="outlined"
                                    color="warning"
                                />
                            ))}
                        </Box>
                    </>
                )}
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onAddToCart(menuItem)}
                    disabled={!menuItem.isAvailable}
                    startIcon={<CartIcon />}
                >
                    {menuItem.isAvailable ? '장바구니에 추가' : '품절'}
                </Button>
            </CardActions>
        </Card>
    );
};

const CustomerMenuScreen: React.FC = () => {
    const navigate = useNavigate();
    const { storeId } = useParams<{ storeId: string }>();

    const {
        currentStore,
        categories,
        menuItems,
        isLoading,
        error,
        fetchStore,
        subscribeToCategories,
        subscribeToMenuItems,
        unsubscribeFromCategories,
        unsubscribeFromMenuItems,
    } = useStoreStore();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');


    // WebView 렌더링 최적화
    useEffect(() => {
        optimizeWebViewTransition();
    }, []);

    // 매장 정보 및 메뉴 데이터 로드
    useEffect(() => {
        if (storeId) {
            fetchStore(storeId);
            subscribeToCategories(storeId);
            subscribeToMenuItems(storeId);
        }

        return () => {
            unsubscribeFromCategories();
            unsubscribeFromMenuItems();
        };
    }, [storeId, fetchStore, subscribeToCategories, subscribeToMenuItems, unsubscribeFromCategories, unsubscribeFromMenuItems]);

    // 첫 번째 카테고리 자동 선택
    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    // 필터링된 메뉴 아이템
    const filteredMenuItems = useMemo(() => {
        if (!selectedCategoryId) {
            return [];
        }
        return menuItems.filter(item => item.categoryId === selectedCategoryId);
    }, [menuItems, selectedCategoryId]);

    // 카테고리별 메뉴 개수
    const getCategoryMenuCount = (categoryId: string) => {
        return menuItems.filter(item => item.categoryId === categoryId).length;
    };

    const handleBack = () => {
        optimizeWebViewTransition();
        navigate('/stores');
    };

    const handleAddToCart = (menuItem: MenuItem) => {
        // TODO: 실제 장바구니 시스템 구현
        console.log('장바구니에 추가:', menuItem);
    };

    const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedCategoryId(newValue);
    };

    // 슬라이드 핸들러
    const handleSwipe = (direction: 'left' | 'right') => {
        if (categories.length === 0) return;

        const currentIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
        if (currentIndex === -1) return;

        let newIndex: number;

        if (direction === 'left') {
            // 오른쪽으로 슬라이드 (다음 카테고리)
            newIndex = (currentIndex + 1) % categories.length;
        } else {
            // 왼쪽으로 슬라이드 (이전 카테고리)
            newIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
        }

        setSelectedCategoryId(categories[newIndex].id);
    };

    // 슬라이드 이벤트 설정
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),
        onSwipedRight: () => handleSwipe('right'),
        preventScrollOnSwipe: true,
        trackMouse: false,
        delta: 50, // 최소 슬라이드 거리
        swipeDuration: 500, // 슬라이드 지속 시간
    });

    if (isLoading) {
        return <LoadingSpinner message="메뉴를 불러오는 중..." />;
    }

    if (error) {
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
                            메뉴
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="md" sx={{ py: 2 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    if (!currentStore) {
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
                            메뉴
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="md" sx={{ py: 2 }}>
                    <EmptyState
                        icon={<MenuIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                        title="매장을 찾을 수 없습니다"
                        description="요청하신 매장 정보를 불러올 수 없어요."
                    />
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppHeader title={currentStore.name} onBackClick={handleBack} />

            <Box sx={{ p: 2 }}>
                {/* 매장 정보 */}
                <StoreInfoCard store={currentStore} />

                {/* 카테고리 탭 */}
                {categories.length > 0 && (
                    <Paper sx={{ mb: 2 }}>
                        <Tabs
                            value={selectedCategoryId}
                            onChange={handleCategoryChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ px: 2 }}
                        >
                            {categories.map((category) => (
                                <Tab
                                    key={category.id}
                                    label={`${category.icon} ${category.name} (${getCategoryMenuCount(category.id)})`}
                                    value={category.id}
                                />
                            ))}
                        </Tabs>
                        {categories.length > 1 && (
                            <Box sx={{ px: 2, pb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    💡 좌우로 슬라이드하여 카테고리를 변경할 수 있습니다
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                )}

                {/* 메뉴 목록 */}
                <Box {...swipeHandlers} sx={{ touchAction: 'pan-y' }}>
                    {filteredMenuItems.length === 0 ? (
                        <EmptyState
                            icon={<MenuIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                            title="메뉴가 없습니다"
                            description="이 카테고리에 등록된 메뉴가 없어요."
                        />
                    ) : (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 2
                        }}>
                            {filteredMenuItems.map((menuItem) => (
                                <MenuItemCard
                                    key={menuItem.id}
                                    menuItem={menuItem}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CustomerMenuScreen; 