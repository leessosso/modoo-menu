import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Button
} from '@mui/material';
import { 
    Person, 
    Email, 
    Phone, 
    CalendarToday, 
    Security,
    ArrowBack,
    Edit
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { UI_CONSTANTS } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import { useNavigate } from 'react-router-dom';

const AccountInfoScreen: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const handleBack = () => {
        optimizeWebViewTransition(() => {
            navigate(-1);
        });
    };

    const handleEditProfile = () => {
        optimizeWebViewTransition(() => {
            navigate('/user-profile');
        });
    };

    const formatDate = (date: Date | string) => {
        if (!date) return '정보 없음';
        const d = new Date(date);
        return d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'store_owner':
                return 'primary';
            case 'customer':
                return 'secondary';
            case 'admin':
                return 'error';
            default:
                return 'default';
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
                    계정 정보
                </Typography>
            </Box>

            <Paper sx={{ p: 4 }}>
                {/* 프로필 헤더 */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    mb: 4,
                    py: 3,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 2
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
                        color={getRoleColor(user?.role || '') as any}
                        sx={{ color: 'white' }}
                    />
                </Box>

                {/* 계정 정보 */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            기본 정보
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <Person color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="이름" 
                                    secondary={user?.name || '정보 없음'}
                                />
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <Email color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="이메일" 
                                    secondary={user?.email || '정보 없음'}
                                    secondaryTypographyProps={{ 
                                        sx: { wordBreak: 'break-all' }
                                    }}
                                />
                            </ListItem>

                            {user?.phone && (
                                <ListItem>
                                    <ListItemIcon>
                                        <Phone color="primary" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="전화번호" 
                                        secondary={user.phone}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            계정 세부사항
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <Security color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="계정 유형" 
                                    secondary={getRoleLabel(user?.role || '')}
                                />
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <CalendarToday color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="가입일" 
                                    secondary={formatDate(user?.createdAt || '')}
                                />
                            </ListItem>

                            {user?.lastLoginAt && (
                                <ListItem>
                                    <ListItemIcon>
                                        <CalendarToday color="primary" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="마지막 로그인" 
                                        secondary={formatDate(user.lastLoginAt)}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 액션 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleEditProfile}
                        startIcon={<Edit />}
                        sx={{ 
                            px: 4, 
                            py: 1.5,
                            minWidth: 200
                        }}
                    >
                        프로필 수정
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AccountInfoScreen; 