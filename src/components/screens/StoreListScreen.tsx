import React, { useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Fab,
} from '@mui/material';
import { Add, Edit, Delete, Store, Schedule, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';

const StoreListScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { stores, fetchStores, deleteStore, isLoading, error, clearError } = useStoreStore();

    useEffect(() => {
        if (user) {
            fetchStores(user.id);
        }
    }, [user, fetchStores]);

    const handleAddStore = () => {
        navigate('/store-register');
    };

    const handleEditStore = (storeId: string) => {
        navigate(`/store-edit/${storeId}`);
    };

    const handleDeleteStore = async (storeId: string) => {
        if (window.confirm('정말로 이 매장을 삭제하시겠습니까?')) {
            try {
                await deleteStore(storeId);
            } catch (error) {
                console.error('매장 삭제 실패:', error);
            }
        }
    };

    const handleViewStore = (storeId: string) => {
        navigate(`/store-detail/${storeId}`);
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary">
                    내 매장 관리
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    등록된 매장들을 관리하세요
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                    {error}
                </Alert>
            )}

            {stores.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        등록된 매장이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        첫 번째 매장을 등록해보세요
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddStore}
                    >
                        매장 등록
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {stores.map((store) => (
                        <Card key={store.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Store sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" component="h2">
                                        {store.name}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {store.description}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        {store.phone}
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        {store.businessHours}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={store.isOpen ? '영업중' : '영업종료'}
                                        color={store.isOpen ? 'success' : 'default'}
                                        size="small"
                                    />
                                    <Chip
                                        label={`${store.categories.length}개 카테고리`}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                <Button
                                    size="small"
                                    onClick={() => handleViewStore(store.id)}
                                >
                                    상세보기
                                </Button>
                                <Box>
                                    <Button
                                        size="small"
                                        startIcon={<Edit />}
                                        onClick={() => handleEditStore(store.id)}
                                        sx={{ mr: 1 }}
                                    >
                                        수정
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => handleDeleteStore(store.id)}
                                    >
                                        삭제
                                    </Button>
                                </Box>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={handleAddStore}
            >
                <Add />
            </Fab>
        </Container>
    );
};

export default StoreListScreen; 