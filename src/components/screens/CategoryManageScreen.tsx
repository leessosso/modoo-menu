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
    MenuItem,
    Paper,
    Divider,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Category as CategoryIcon,
    RestaurantMenu as MenuIcon,
} from '@mui/icons-material';
import { useStoreStore } from '../../stores/storeStore';
import DashboardHeader from '../common/DashboardHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import type { Category, CreateCategoryData } from '../../types/store';
import { useNavigate } from 'react-router-dom';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';

const CATEGORY_ICONS = [
    { value: '🍕', label: '피자' },
    { value: '🍔', label: '햄버거' },
    { value: '🍗', label: '치킨' },
    { value: '🍜', label: '라면/국수' },
    { value: '🍱', label: '도시락' },
    { value: '🥗', label: '샐러드' },
    { value: '🍰', label: '디저트' },
    { value: '☕', label: '음료' },
    { value: '🍻', label: '주류' },
    { value: '🥘', label: '메인요리' },
    { value: '🍴', label: '기타' },
];

const CategoryManageScreen: React.FC = () => {
    const navigate = useNavigate();
    const {
        currentStore,
        stores,
        categories,
        isLoading,
        error,
        subscribeToCategories,
        unsubscribeFromCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        clearError,
    } = useStoreStore();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: '🍴',
    });

    // 매장 자동 선택은 App.tsx에서 전역적으로 처리됨

    useEffect(() => {
        if (currentStore?.id) {
            subscribeToCategories(currentStore.id);
        }

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            if (currentStore?.id) {
                unsubscribeFromCategories();
            }
        };
    }, [currentStore?.id, subscribeToCategories, unsubscribeFromCategories]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [error, clearError]);

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                icon: category.icon,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                icon: '🍴',
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            icon: '🍴',
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !currentStore?.id) return;

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, {
                    name: formData.name.trim(),
                    icon: formData.icon,
                });
            } else {
                const categoryData: CreateCategoryData = {
                    name: formData.name.trim(),
                    icon: formData.icon,
                    storeId: currentStore.id,
                };
                await createCategory(categoryData);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('카테고리 저장 실패:', error);
        }
    };

    const handleDelete = async (categoryId: string, categoryName: string) => {
        if (window.confirm(`'${categoryName}' 카테고리를 삭제하시겠습니까?\n\n카테고리에 포함된 모든 메뉴도 함께 삭제됩니다.`)) {
            try {
                await deleteCategory(categoryId);
            } catch (error) {
                console.error('카테고리 삭제 실패:', error);
            }
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
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

    // 로딩 중인 경우
    if (isLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <LoadingSpinner />
            </Box>
        );
    }

    // 매장이 없는 경우
    if (stores.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <DashboardHeader title="카테고리 관리" />
                <EmptyState
                    icon={<CategoryIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                    title="등록된 매장이 없습니다"
                    description="먼저 매장을 등록해주세요."
                    actionLabel="매장 등록"
                    onAction={() => {
                        // 매장 등록 페이지로 이동
                        window.location.href = '/store-register';
                    }}
                />
            </Box>
        );
    }

    // 매장이 선택되지 않은 경우
    if (!currentStore) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">
                    매장을 선택해주세요.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <DashboardHeader title="카테고리 관리" />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon />
                            {currentStore.name} - 카테고리 관리
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
                            카테고리 추가
                        </Button>
                    </Box>
                    <Divider />
                </CardContent>
            </Card>

            {isLoading ? (
                <LoadingSpinner />
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={<CategoryIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                    title="등록된 카테고리가 없습니다"
                    description="첫 번째 카테고리를 추가해보세요."
                    actionLabel="카테고리 추가"
                    onAction={() => handleOpenDialog()}
                />
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 2,
                    }}
                >
                    {categories.map((category) => (
                        <Card
                            key={category.id}
                            sx={{
                                height: '100%',
                                '&:hover': {
                                    boxShadow: 3,
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            fontSize: '24px',
                                            mr: 2,
                                        }}
                                    >
                                        {category.icon}
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" noWrap>
                                            {category.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            메뉴 {category.items?.length || 0}개
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        <DragIcon />
                                    </IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<MenuIcon />}
                                        color="primary"
                                        onClick={() => {
                                            optimizeWebViewTransition(() => {
                                                navigate('/menu-manage');
                                            });
                                        }}
                                    >
                                        메뉴 관리
                                    </Button>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(category)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(category.id, category.name)}
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

            {/* 카테고리 추가/수정 다이얼로그 */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingCategory ? '카테고리 수정' : '카테고리 추가'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="카테고리 이름"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="예: 메인요리, 음료, 디저트"
                            autoFocus
                        />

                        <FormControl fullWidth>
                            <InputLabel>아이콘</InputLabel>
                            <Select
                                value={formData.icon}
                                label="아이콘"
                                onChange={(e) => handleInputChange('icon', e.target.value)}
                            >
                                {CATEGORY_ICONS.map((icon) => (
                                    <MenuItem key={icon.value} value={icon.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span style={{ fontSize: '20px' }}>{icon.value}</span>
                                            <span>{icon.label}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ fontSize: '24px' }}>{formData.icon}</span>
                                <Typography variant="h6">
                                    {formData.name || '카테고리 이름'}
                                </Typography>
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
                        disabled={!formData.name.trim() || isLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                        }}
                    >
                        {editingCategory ? '수정' : '추가'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManageScreen; 