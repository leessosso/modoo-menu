import React, { useState, useCallback, memo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import type { LoginCredentials } from '../../types/auth';

const LoginScreen: React.FC = memo(() => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(credentials);
  }, [credentials, login, clearError]);

  const handleChange = useCallback((field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
                    로그인
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    모두의 메뉴에 오신 것을 환영합니다
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
                  onClick={handleTogglePassword}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
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
            {isLoading ? <CircularProgress size={24} /> : '로그인'}
          </Button>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
                            계정이 없으신가요?{' '}
              <Link to="/register" style={{ textDecoration: 'underline' }}>
                                회원가입
              </Link>
            </Typography>
          </Box>

          {/* 테스트 계정 */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                            💡 테스트 계정으로 빠르게 시작해보세요
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => { setCredentials({
                  email: 'customer@test.com',
                  password: 'test123456',
                }); }}
              >
                                고객 계정
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => { setCredentials({
                  email: 'owner@test.com',
                  password: 'test123456',
                }); }}
              >
                                매장관리자 계정
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
});

export default LoginScreen; 