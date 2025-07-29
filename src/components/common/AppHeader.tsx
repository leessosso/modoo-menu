import React from 'react';
import {
    Box,
    Container,
    Typography,
    Avatar,
    IconButton,
    Button
} from '@mui/material';
import {
    Person
} from '@mui/icons-material';

import { UI_CONSTANTS } from '../../constants';
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
        <Box
            sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: UI_CONSTANTS.SPACING.MD,
            }}
        >
            <Container maxWidth={maxWidth}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {onBackClick && (
                            <Button
                                variant="text"
                                onClick={onBackClick}
                                sx={{
                                    color: 'white',
                                    minWidth: 'auto',
                                    px: 1,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                ← 뒤로
                            </Button>
                        )}
                        <Typography variant="h4" component="h1">
                            {icon} {title}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            onClick={handleUserMenuClick}
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
    );
};

export default AppHeader; 