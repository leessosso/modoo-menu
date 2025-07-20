import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh, Home } from '@mui/icons-material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReload = () => {
        // 웹뷰에서 안전한 리로드
        try {
            window.location.href = window.location.origin + window.location.pathname + '#/login';
            window.location.reload();
        } catch (error) {
            // 최후의 수단
            window.location.reload();
        }
    };

    private handleReset = () => {
        // 상태 리셋 및 로그인 페이지로 이동
        try {
            localStorage.clear();
            sessionStorage.clear();
            this.setState({ hasError: false });
            window.location.href = window.location.origin + window.location.pathname + '#/login';
        } catch (error) {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        p: 3,
                        bgcolor: 'background.default'
                    }}
                >
                    <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                        <Typography variant="h5" color="error" gutterBottom>
                            오류가 발생했습니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            앱에서 예상치 못한 오류가 발생했습니다. 새로고침을 시도해주세요.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={this.handleReload}
                                sx={{ flex: 1 }}
                            >
                                새로고침
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Home />}
                                onClick={this.handleReset}
                                sx={{ flex: 1 }}
                            >
                                처음으로
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 