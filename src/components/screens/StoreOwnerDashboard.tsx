import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Card,
    CardContent,
    Avatar,
    Divider,
    Chip,
} from '@mui/material';
import {
    Add,
    Edit,
    MenuBook,
    Receipt,
    Person,
    Logout,
    TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const StoreOwnerDashboard: React.FC = () => {
    const { user, logout } = useAuth();

    // 임시 매장 데이터 (나중에 Firebase에서 가져올 예정)
    const mockStores = [
        {
            id: '1',
            name: '맛있는 카페',
            description: '신선한 원두로 내린 커피',
            isOpen: true,
            orderCount: 15,
            revenue: 125000,
        },
        {
            id: '2',
            name: '피자 전문점',
            description: '정통 이탈리안 피자',
            isOpen: false,
            orderCount: 8,
            revenue: 89000,
        },
    ];

    const handleLogout = () => {
        logout();
    };

    const menuItems = [
        {
            title: '매장 등록',
            description: '새로운 매장을 등록하세요',
            icon: <Add sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary.main',
            path: '/store/register',
        },
        {
            title: '메뉴 관리',
            description: '카테고리와 메뉴를 관리하세요',
            icon: <MenuBook sx={{ fontSize: 40, color: 'secondary.main' }} />,
            color: 'secondary.main',
            path: '/store/menu',
        },
        {
            title: '주문 관리',
            description: '실시간 주문을 확인하세요',
            icon: <Receipt sx={{ fontSize: 40, color: 'success.main' }} />,
            color: 'success.main',
            path: '/store/orders',
        },
        {
            title: '통계',
            description: '매장 성과를 확인하세요',
            icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
            color: 'info.main',
            path: '/store/stats',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* 헤더 */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 3,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" component="h1">
                            🏪 매장관리자 대시보드
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    <Person />
                                </Avatar>
                                <Typography variant="body2">
                                    {user?.name}
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleLogout}
                                startIcon={<Logout />}
                                sx={{ color: 'white', borderColor: 'white' }}
                            >
                                로그아웃
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* 메인 콘텐츠 */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* 환영 메시지 */}
                <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary">
                        안녕하세요, {user?.name}님! 🏪
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        오늘도 매장을 성공적으로 운영해보세요.
                    </Typography>
                </Paper>

                {/* 매장 목록 */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" component="h3">
                            내 매장 목록
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            size="small"
                        >
                            새 매장 등록
                        </Button>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                        {mockStores.map((store) => (
                            <Card key={store.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" component="h4" gutterBottom>
                                                {store.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {store.description}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={store.isOpen ? '영업중' : '휴무'}
                                            color={store.isOpen ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                오늘 주문
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                {store.orderCount}건
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                오늘 매출
                                            </Typography>
                                            <Typography variant="h6" color="success.main">
                                                {store.revenue.toLocaleString()}원
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" startIcon={<Edit />}>
                                            수정
                                        </Button>
                                        <Button size="small" startIcon={<MenuBook />}>
                                            메뉴 관리
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Paper>

                {/* 빠른 액션 */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                    {menuItems.map((item, index) => (
                        <Card
                            key={index}
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
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Box sx={{ mb: 2 }}>
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

                {/* 통계 요약 */}
                <Paper sx={{ p: 4, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        📊 오늘의 통계
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary" gutterBottom>
                                23
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 주문 건수
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" gutterBottom>
                                214,000원
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 매출
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main" gutterBottom>
                                2
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                운영 중인 매장
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default StoreOwnerDashboard; 