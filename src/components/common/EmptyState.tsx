import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { UI_CONSTANTS } from '../../constants';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction
}) => {
    return (
        <Box textAlign="center" py={8}>
            <Box
                sx={{
                    mb: UI_CONSTANTS.SPACING.SM,
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: UI_CONSTANTS.ICON_SIZES.XLARGE,
                    color: 'text.secondary'
                }}
            >
                {icon}
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: UI_CONSTANTS.SPACING.MD }}>
                {description}
            </Typography>
            {actionLabel && onAction && (
                <Button
                    variant="contained"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState; 