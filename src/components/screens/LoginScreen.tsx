import React, { useState, useCallback, useEffect } from 'react';
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
import { UI_CONSTANTS, TEST_ACCOUNTS, APP_CONFIG } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';

const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // WebView 렌더링 최적화 (로그인 성공 시)
  useEffect(() => {
    if (isAuthenticated) {
      optimizeWebViewTransition();
    }
  }, [isAuthenticated]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // WebView에서 즉시 응답성을 위한 강제 리렌더링
    optimizeWebViewTransition();

    await login(credentials);
  }, [credentials, login, clearError]);

  const handleChange = useCallback((field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleTestAccountLogin = useCallback((accountType: 'CUSTOMER' | 'STORE_OWNER') => {
    const account = TEST_ACCOUNTS[accountType];
    setCredentials({
      email: account.email,
      password: account.password,
    });
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
      <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          로그인
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: UI_CONSTANTS.SPACING.LG }}>
          {APP_CONFIG.NAME}에 오신 것을 환영합니다
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: UI_CONSTANTS.SPACING.MD }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: UI_CONSTANTS.SPACING.SM }}>
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
            sx={{ mt: UI_CONSTANTS.SPACING.MD, mb: UI_CONSTANTS.SPACING.SM }}
          >
            {isLoading ? <CircularProgress size={24} /> : '로그인'}
          </Button>

          <Box sx={{ mt: UI_CONSTANTS.SPACING.SM }}>
            <Typography variant="body2" color="text.secondary">
              계정이 없으신가요?{' '}
              <Link to={APP_CONFIG.ROUTES.REGISTER} style={{ textDecoration: 'underline' }}>
                회원가입
              </Link>
            </Typography>
          </Box>

          {/* 테스트 계정 */}
          <Box sx={{ mt: UI_CONSTANTS.SPACING.LG, p: UI_CONSTANTS.SPACING.MD, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              💡 테스트 계정으로 빠르게 시작해보세요
            </Typography>
            <Box sx={{ display: 'flex', gap: UI_CONSTANTS.SPACING.SM, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleTestAccountLogin('CUSTOMER')}
              >
                {TEST_ACCOUNTS.CUSTOMER.label}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleTestAccountLogin('STORE_OWNER')}
              >
                {TEST_ACCOUNTS.STORE_OWNER.label}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginScreen; 