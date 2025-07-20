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
} from '@mui/material';
import {
    Restaurant,
    QrCode,
    Person,
    Logout,
    History,
    Favorite,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DashboardScreen: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const menuItems = [
        {
            title: 'QR코드 스캔',
            description: '매장의 QR코드를 스캔하여 바로 주문하세요',
            icon: <QrCode sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary.main',
        },
        {
            title: '매장 선택',
            description: '원하는 매장을 선택하여 메뉴를 확인하세요',
            icon: <Restaurant sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary.main',
        },
        {
            title: '주문 내역',
            description: '이전 주문 내역을 확인하세요',
            icon: <History sx={{ fontSize: 40, color: 'secondary.main' }} />,
            color: 'secondary.main',
        },
        {
            title: '즐겨찾기',
            description: '자주 방문하는 매장을 즐겨찾기에 추가하세요',
            icon: <Favorite sx={{ fontSize: 40, color: 'error.main' }} />,
            color: 'error.main',
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
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" component="h1">
                            🍽️ 모두의 메뉴
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
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* 환영 메시지 */}
                <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary">
                        안녕하세요, {user?.name}님! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        오늘은 어떤 매장에서 주문하실 건가요?
                    </Typography>
                </Paper>

                {/* 메뉴 그리드 */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
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

                {/* 빠른 액션 */}
                <Paper sx={{ p: 4, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        빠른 주문
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<QrCode />}
                            sx={{ flex: 1, minWidth: 200 }}
                        >
                            QR코드 스캔
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<Restaurant />}
                            sx={{ flex: 1, minWidth: 200 }}
                        >
                            매장 선택
                        </Button>
                    </Box>
                </Paper>

                {/* 사용자 정보 */}
                <Paper sx={{ p: 4, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        내 정보
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
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
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default DashboardScreen; 