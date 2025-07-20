import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Link,
} from '@mui/material';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import type { RegisterCredentials } from '../../types/auth';

const RegisterScreen: React.FC = () => {
    const { register, isLoading, error, clearError } = useAuth();
    const [credentials, setCredentials] = useState<RegisterCredentials>({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        await register(credentials);
    };

    const handleChange = (field: keyof RegisterCredentials) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setCredentials(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary">
                    회원가입
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    모두의 메뉴 계정을 만들어보세요
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="이름"
                        value={credentials.name}
                        onChange={handleChange('name')}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                    />
                    <TextField
                        fullWidth
                        label="이메일"
                        type="email"
                        value={credentials.email}
                        onChange={handleChange('email')}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                    />
                    <TextField
                        fullWidth
                        label="전화번호 (선택)"
                        type="tel"
                        value={credentials.phone}
                        onChange={handleChange('phone')}
                        margin="normal"
                        InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                    />
                    <TextField
                        fullWidth
                        label="비밀번호"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange('password')}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                            endAdornment: (
                                <Button
                                    onClick={() => setShowPassword(!showPassword)}
                                    sx={{ minWidth: 'auto', p: 0.5 }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </Button>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="비밀번호 확인"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={credentials.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                            endAdornment: (
                                <Button
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    sx={{ minWidth: 'auto', p: 0.5 }}
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </Button>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : '회원가입'}
                    </Button>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" underline="hover">
                                로그인
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterScreen; 