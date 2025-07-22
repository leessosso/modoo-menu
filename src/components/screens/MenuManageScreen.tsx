import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem as MUIMenuItem,
    FormControlLabel,
    Switch,
    Chip,
    Paper,
    Divider,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    RestaurantMenu as MenuIcon,
    Star as StarIcon,
    Visibility as VisibleIcon,
    VisibilityOff as HiddenIcon,
    AttachMoney as PriceIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { useStoreStore } from '../../stores/storeStore';
import DashboardHeader from '../common/DashboardHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import type { MenuItem as MenuItemType, CreateMenuItemData, Category } from '../../types/store';
import { UI_CONSTANTS } from '../../constants';

const ALLERGEN_OPTIONS = [
    '글루텐', '우유', '달걀', '견과류', '땅콩', '조개류', '생선', '대두', '참깨', '메밀'
];

const MenuManageScreen: React.FC = () => {
    const {
        currentStore,
        categories,
        menuItems,
        isLoading,
        error,
        fetchCategories,
        fetchMenuItems,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        clearError,
    } = useStoreStore();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        allergens: [] as string[],
        isPopular: false,
        isAvailable: true,
    });

    useEffect(() => {
        if (currentStore?.id) {
            fetchCategories(currentStore.id);
            fetchMenuItems();
        }
    }, [currentStore?.id, fetchCategories, fetchMenuItems]);

    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
    };

    const handleOpenDialog = (item?: MenuItemType) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price.toString(),
                categoryId: item.categoryId,
                allergens: item.allergens || [],
                isPopular: item.isPopular || false,
                isAvailable: item.isAvailable,
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                categoryId: selectedCategoryId || categories[0]?.id || '',
                allergens: [],
                isPopular: false,
                isAvailable: true,
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
            allergens: [],
            isPopular: false,
            isAvailable: true,
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.price.trim() || !formData.categoryId || !currentStore?.id) return;

        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            alert('올바른 가격을 입력해주세요.');
            return;
        }

        try {
            if (editingItem) {
                await updateMenuItem(editingItem.id, {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    price,
                    allergens: formData.allergens,
                    isPopular: formData.isPopular,
                    isAvailable: formData.isAvailable,
                });
            } else {
                const itemData: CreateMenuItemData = {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    price,
                    categoryId: formData.categoryId,
                    storeId: currentStore.id,
                    allergens: formData.allergens,
                    isPopular: formData.isPopular,
                    isAvailable: formData.isAvailable,
                };
                await createMenuItem(itemData);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('메뉴 저장 실패:', error);
        }
    };

    const handleDelete = async (itemId: string, itemName: string) => {
        if (window.confirm(`'${itemName}' 메뉴를 삭제하시겠습니까?`)) {
            try {
                await deleteMenuItem(itemId);
            } catch (error) {
                console.error('메뉴 삭제 실패:', error);
            }
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAllergenToggle = (allergen: string) => {
        setFormData(prev => ({
            ...prev,
            allergens: prev.allergens.includes(allergen)
                ? prev.allergens.filter(a => a !== allergen)
                : [...prev.allergens, allergen],
        }));
    };

    const getCurrentCategoryItems = () => {
        if (!selectedCategoryId) return [];
        return menuItems.filter(item => item.categoryId === selectedCategoryId);
    };

    const getCurrentCategoryName = () => {
        const category = categories.find(c => c.id === selectedCategoryId);
        return category?.name || '';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
        }).format(price);
    };

    if (!currentStore) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">
                    매장을 선택해주세요.
                </Alert>
            </Box>
        );
    }

    if (categories.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <DashboardHeader title="메뉴 관리" />
                <EmptyState
                    icon={<CategoryIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                    title="카테고리가 없습니다"
                    description="먼저 카테고리를 생성해주세요."
                />
            </Box>
        );
    }

    const currentItems = getCurrentCategoryItems();

    return (
        <Box sx={{ p: 3 }}>
            <DashboardHeader title="메뉴 관리" />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 상단 헤더 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MenuIcon />
                            {currentStore.name} - 메뉴 관리
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            disabled={isLoading}
                            sx={{
                                background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                            }}
                        >
                            메뉴 추가
                        </Button>
                    </Box>
                    <Divider />
                </CardContent>
            </Card>

            {/* 카테고리 탭 */}
            <Card sx={{ mb: 3 }}>
                <Tabs
                    value={selectedCategoryId}
                    onChange={(_, value) => handleCategoryChange(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {categories.map((category) => (
                        <Tab
                            key={category.id}
                            value={category.id}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                    <Chip
                                        size="small"
                                        label={menuItems.filter(item => item.categoryId === category.id).length}
                                        color="primary"
                                    />
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Card>

            {/* 메뉴 목록 */}
            {isLoading ? (
                <LoadingSpinner />
            ) : currentItems.length === 0 ? (
                <EmptyState
                    icon={<MenuIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                    title={`${getCurrentCategoryName()} 카테고리에 메뉴가 없습니다`}
                    description="첫 번째 메뉴를 추가해보세요."
                    actionLabel="메뉴 추가"
                    onAction={() => handleOpenDialog()}
                />
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                        gap: 2,
                    }}
                >
                    {currentItems.map((item) => (
                        <Card
                            key={item.id}
                            sx={{
                                height: '100%',
                                '&:hover': {
                                    boxShadow: 3,
                                },
                                opacity: item.isAvailable ? 1 : 0.7,
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" noWrap>
                                                {item.name}
                                            </Typography>
                                            {item.isPopular && (
                                                <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                            )}
                                            {!item.isAvailable && (
                                                <HiddenIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                            )}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1, minHeight: 40 }}
                                        >
                                            {item.description}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color="primary.main"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {formatPrice(item.price)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* 알레르기 정보 */}
                                {item.allergens && item.allergens.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            알레르기 정보:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {item.allergens.map((allergen) => (
                                                <Chip
                                                    key={allergen}
                                                    label={allergen}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* 액션 버튼 */}
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(item)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(item.id, item.name)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* 메뉴 추가/수정 다이얼로그 */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingItem ? '메뉴 수정' : '메뉴 추가'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* 기본 정보 */}
                        <TextField
                            fullWidth
                            label="메뉴 이름"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="예: 불고기 피자, 아메리카노"
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            label="메뉴 설명"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="메뉴에 대한 상세 설명을 입력해주세요"
                            multiline
                            rows={3}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="가격 (원)"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                placeholder="0"
                                type="number"
                                InputProps={{
                                    startAdornment: <PriceIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                                sx={{ flex: 1 }}
                            />

                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>카테고리</InputLabel>
                                <Select
                                    value={formData.categoryId}
                                    label="카테고리"
                                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <MUIMenuItem key={category.id} value={category.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{category.icon}</span>
                                                <span>{category.name}</span>
                                            </Box>
                                        </MUIMenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* 알레르기 정보 */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                알레르기 정보
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {ALLERGEN_OPTIONS.map((allergen) => (
                                    <Chip
                                        key={allergen}
                                        label={allergen}
                                        color={formData.allergens.includes(allergen) ? 'warning' : 'default'}
                                        onClick={() => handleAllergenToggle(allergen)}
                                        variant={formData.allergens.includes(allergen) ? 'filled' : 'outlined'}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* 옵션 */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                메뉴 옵션
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isPopular}
                                            onChange={(e) => handleInputChange('isPopular', e.target.checked)}
                                            color="warning"
                                        />
                                    }
                                    label="인기 메뉴"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isAvailable}
                                            onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="판매 중"
                                />
                            </Box>
                        </Box>

                        {/* 미리보기 */}
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: 'background.default',
                                border: '1px dashed',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                미리보기
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6">
                                            {formData.name || '메뉴 이름'}
                                        </Typography>
                                        {formData.isPopular && (
                                            <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                        )}
                                        {!formData.isAvailable && (
                                            <HiddenIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {formData.description || '메뉴 설명'}
                                    </Typography>
                                    <Typography variant="h6" color="primary.main">
                                        {formData.price ? formatPrice(parseFloat(formData.price) || 0) : '₩0'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialog}
                        startIcon={<CancelIcon />}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!formData.name.trim() || !formData.price.trim() || isLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                        }}
                    >
                        {editingItem ? '수정' : '추가'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuManageScreen; 