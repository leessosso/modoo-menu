import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Chip,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button
} from '@mui/material';
import { 
    Person, 
    Email, 
    Phone, 
    Settings,
    AccountCircle,
    Logout,
    ArrowBack
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { UI_CONSTANTS } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import { useNavigate } from 'react-router-dom';

const UserMenuScreen: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleBack = () => {
        optimizeWebViewTransition(() => {
            navigate(-1);
        });
    };

    const handleLogout = () => {
        optimizeWebViewTransition(() => {
            logout();
        });
    };

    const handleNavigation = (path: string) => {
        optimizeWebViewTransition(() => {
            navigate(path);
        });
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'store_owner':
                return '매장관리자';
            case 'customer':
                return '고객';
            case 'admin':
                return '관리자';
            default:
                return '알 수 없음';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ mr: 2 }}
                >
                    뒤로가기
                </Button>
                <Typography variant="h4" component="h1">
                    사용자 메뉴
                </Typography>
            </Box>

            {/* 메인 콘텐츠 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 사용자 프로필 카드 */}
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        py: 3,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 2,
                        mb: 3
                    }}>
                        <Avatar sx={{ 
                            width: 100, 
                            height: 100, 
                            mb: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.2)'
                        }}>
                            <Person sx={{ fontSize: 50 }} />
                        </Avatar>
                        <Typography variant="h5" gutterBottom>
                            {user?.name}
                        </Typography>
                        <Chip 
                            label={getRoleLabel(user?.role || '')} 
                            color="secondary" 
                            sx={{ color: 'white' }}
                        />
                    </Box>

                    {/* 사용자 정보 */}
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        내 정보
                    </Typography>
                    <List sx={{ mb: 2 }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Email color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="이메일" 
                                secondary={user?.email}
                                secondaryTypographyProps={{ 
                                    sx: { wordBreak: 'break-all' }
                                }}
                            />
                        </ListItemButton>
                        {user?.phone && (
                            <ListItemButton>
                                <ListItemIcon>
                                    <Phone color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="전화번호" 
                                    secondary={user.phone}
                                />
                            </ListItemButton>
                        )}
                    </List>
                </Paper>

                {/* 메뉴 액션 카드 */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        설정 및 관리
                    </Typography>
                    
                    <List>
                        <ListItemButton 
                            onClick={() => handleNavigation('/user-profile')}
                            sx={{ 
                                borderRadius: 2, 
                                mb: 1,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white'
                                }
                            }}
                        >
                            <ListItemIcon>
                                <Settings color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="프로필 설정" 
                                secondary="이름, 전화번호 수정"
                            />
                        </ListItemButton>
                        
                        <ListItemButton 
                            onClick={() => handleNavigation('/account-info')}
                            sx={{ 
                                borderRadius: 2, 
                                mb: 1,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white'
                                }
                            }}
                        >
                            <ListItemIcon>
                                <AccountCircle color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="계정 정보" 
                                secondary="가입일, 계정 유형 등 상세 정보"
                            />
                        </ListItemButton>
                    </List>
                </Paper>

                {/* 로그아웃 카드 */}
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            startIcon={<Logout />}
                            sx={{ 
                                py: 2,
                                maxWidth: 300,
                                borderColor: 'error.main',
                                color: 'error.main',
                                '&:hover': {
                                    bgcolor: 'error.main',
                                    color: 'white'
                                }
                            }}
                        >
                            로그아웃
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default UserMenuScreen; 