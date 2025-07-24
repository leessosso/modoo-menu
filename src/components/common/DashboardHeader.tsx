import React from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Avatar,
    IconButton
} from '@mui/material';
import { 
    Person
} from '@mui/icons-material';

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
    maxWidth = 'lg'
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
                    <Typography variant="h4" component="h1">
                        {icon} {title}
                    </Typography>
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

export default DashboardHeader; 