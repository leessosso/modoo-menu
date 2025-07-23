import React, { useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Avatar, 
    Drawer, 
    List, 
    ListItem, 
    ListItemButton,
    ListItemIcon, 
    ListItemText, 
    Divider,
    IconButton,
    Chip,
    Button
} from '@mui/material';
import { 
    Person, 
    Logout, 
    Settings, 
    AccountCircle, 
    Email,
    Phone,
    Close
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { UI_CONSTANTS } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
    title: string;
    icon?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
    onLogout?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title,
    icon = '',
    maxWidth = 'lg',
    onLogout
}) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // 로그아웃 핸들러
    const handleLogout = onLogout || (() => {
        optimizeWebViewTransition(() => {
            logout();
        });
    });

    // 사용자 아이콘 클릭 핸들러
    const handleUserIconClick = () => {
        optimizeWebViewTransition(() => {
            setDrawerOpen(true);
        });
    };

    // Drawer 닫기 핸들러
    const handleDrawerClose = () => {
        optimizeWebViewTransition(() => {
            setDrawerOpen(false);
        });
    };

    // Drawer에서 로그아웃 핸들러
    const handleLogoutFromDrawer = () => {
        handleDrawerClose();
        setTimeout(() => {
            handleLogout();
        }, 150);
    };

    // 네비게이션 핸들러
    const handleNavigation = (path: string) => {
        handleDrawerClose();
        optimizeWebViewTransition(() => {
            navigate(path);
        });
    };

    // Drawer 스타일 정의
    const drawerPaperStyles = {
        width: 320,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: 'none',
        position: 'fixed' as const,
        top: 0,
        right: 0,
        height: '100vh',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1300,
        overflow: 'hidden',
        '& .MuiDrawer-paper': {
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: 320,
            maxWidth: '100vw'
        }
    };

    const drawerStyles = {
        '& .MuiDrawer-root': {
            position: 'fixed' as const,
            top: 0,
            right: 0,
            height: '100vh',
            width: 'auto',
            zIndex: 1300
        },
        '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200
        },
        '& .MuiModal-root': {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200
        }
    };

    const backdropStyles = {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200
    };

    // 사용자 프로필 섹션 컴포넌트
    const UserProfileSection: React.FC<{ user: any }> = ({ user }) => (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 3,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            mb: 2
        }}>
            <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)'
            }}>
                <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
                {user?.name}
            </Typography>
            <Chip 
                label={user?.role === 'store_owner' ? '매장관리자' : '고객'} 
                color="secondary" 
                size="small"
            />
        </Box>
    );

    // 사용자 정보 리스트 컴포넌트
    const UserInfoList: React.FC<{ user: any }> = ({ user }) => (
        <List sx={{ mb: 2 }}>
            <ListItem>
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
    );

    return (
        <>
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: UI_CONSTANTS.SPACING.MD,
                }}
            >
                <Container maxWidth={maxWidth}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" component="h1">
                            {icon} {title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={handleUserIconClick}
                                sx={{
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                <Avatar sx={UI_CONSTANTS.AVATAR_SIZES.MEDIUM}>
                                    <Person />
                                </Avatar>
                            </IconButton>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* 사용자 정보 Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                variant="temporary"
                ModalProps={{
                    keepMounted: true,
                    disableScrollLock: true,
                    disableEnforceFocus: true,
                    disableAutoFocus: true,
                    disablePortal: false,
                    hideBackdrop: false,
                    closeAfterTransition: true
                }}
                PaperProps={{
                    sx: drawerPaperStyles
                }}
                sx={drawerStyles}
                slotProps={{
                    backdrop: {
                        sx: backdropStyles
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* 헤더 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2">
                            사용자 정보
                        </Typography>
                        <IconButton onClick={handleDrawerClose} size="small">
                            <Close />
                        </IconButton>
                    </Box>

                    {/* 사용자 프로필 */}
                    <UserProfileSection user={user} />

                    {/* 사용자 정보 리스트 */}
                    <UserInfoList user={user} />

                    <Divider sx={{ my: 2 }} />

                    {/* 액션 버튼들 */}
                    <List>
                        <ListItemButton onClick={() => handleNavigation('/user-profile')}>
                            <ListItemIcon>
                                <Settings color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="프로필 설정" />
                        </ListItemButton>
                        
                        <ListItemButton onClick={() => handleNavigation('/account-info')}>
                            <ListItemIcon>
                                <AccountCircle color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="계정 정보" />
                        </ListItemButton>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    {/* 로그아웃 버튼 */}
                    <Box sx={{ p: 1 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={handleLogoutFromDrawer}
                            startIcon={<Logout />}
                            sx={{ 
                                py: 1.5,
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
                </Box>
            </Drawer>
        </>
    );
};

export default DashboardHeader; 