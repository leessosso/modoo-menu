import React from 'react';
import {
    Box,
    Container,
    Typography,
    Avatar,
    IconButton,
    Button,
    AppBar,
    Toolbar
} from '@mui/material';
import {
    Person
} from '@mui/icons-material';


import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
    title: string;
    icon?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
    onLogout?: () => void;
    onBackClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    icon = '',
    maxWidth = 'lg',
    onBackClick
}) => {
    // user 정보는 UserMenuScreen에서 처리
    const navigate = useNavigate();

    // 사용자 메뉴 페이지로 이동
    const handleUserMenuClick = () => {
        optimizeWebViewTransition(() => {
            navigate('/user-menu');
        });
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                top: 0,
                bgcolor: 'primary.main',
                boxShadow: 1,
            }}
        >
            <Container maxWidth={maxWidth}>
                <Toolbar sx={{ minHeight: '56px', py: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {onBackClick && (
                                <Button
                                    variant="text"
                                    onClick={onBackClick}
                                    sx={{
                                        color: 'white',
                                        minWidth: 'auto',
                                        px: 1,
                                        py: 0.5,
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    ← 뒤로
                                </Button>
                            )}
                            <Typography
                                variant="h6"
                                component="h1"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '1rem', sm: '1.125rem' }
                                }}
                            >
                                {icon} {title}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={handleUserMenuClick}
                                sx={{
                                    color: 'white',
                                    p: 0.5,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <Person />
                                </Avatar>
                            </IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default AppHeader; 