import React from 'react';
import { Box, Container, Typography, Button, Avatar } from '@mui/material';
import { Person, Logout } from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { UI_CONSTANTS } from '../../constants';

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

    const handleLogout = onLogout || (() => logout());

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: UI_CONSTANTS.SPACING.SM }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={UI_CONSTANTS.AVATAR_SIZES.MEDIUM}>
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
    );
};

export default DashboardHeader; 