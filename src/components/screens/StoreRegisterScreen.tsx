import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import type { CreateStoreData } from '../../types/store';
import { UI_CONSTANTS, STEPPER_STEPS } from '../../constants';

const StoreRegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createStore, isLoading, error, clearError } = useStoreStore();

  const [activeStep, setActiveStep] = useState(0);
  const [storeData, setStoreData] = useState<CreateStoreData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    businessHours: '',
  });

  const handleSubmit = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      clearError();
      await createStore(storeData, user.id);
      navigate('/store-dashboard');
    } catch (error) {
      console.error('매장 생성 실패:', error);
    }
  }, [storeData, user, createStore, clearError, navigate]);

  const handleChange = useCallback((field: keyof CreateStoreData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStoreData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  }, []);

  const handleNext = useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }, []);

  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 0:
        return !!(storeData.name && storeData.description);
      case 1:
        return !!(storeData.address && storeData.phone && storeData.businessHours);
      default:
        return true;
    }
  }, [storeData]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: UI_CONSTANTS.SPACING.MD }}>
            <TextField
              fullWidth
              label="매장명"
              value={storeData.name}
              onChange={handleChange('name')}
              required
              helperText="고객에게 표시될 매장 이름을 입력하세요"
            />
            <TextField
              fullWidth
              label="매장 설명"
              value={storeData.description}
              onChange={handleChange('description')}
              multiline
              rows={4}
              required
              helperText="매장의 특징이나 주요 메뉴를 소개해주세요"
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: UI_CONSTANTS.SPACING.MD }}>
            <TextField
              fullWidth
              label="매장 주소"
              value={storeData.address}
              onChange={handleChange('address')}
              required
              helperText="고객이 찾아올 수 있는 정확한 주소를 입력하세요"
            />
            <TextField
              fullWidth
              label="전화번호"
              value={storeData.phone}
              onChange={handleChange('phone')}
              type="tel"
              required
              helperText="예: 02-1234-5678"
            />
            <TextField
              fullWidth
              label="영업시간"
              value={storeData.businessHours}
              onChange={handleChange('businessHours')}
              required
              helperText="예: 월-금 09:00-22:00, 주말 10:00-21:00"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: UI_CONSTANTS.SPACING.LG }}>
            <Typography variant="h5" gutterBottom color="primary">
              🎉 매장 등록 준비 완료!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: UI_CONSTANTS.SPACING.MD }}>
              입력하신 정보로 매장을 등록하시겠습니까?
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: UI_CONSTANTS.SPACING.MD, borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>매장 정보 요약</Typography>
              <Typography variant="body2">• 매장명: {storeData.name}</Typography>
              <Typography variant="body2">• 설명: {storeData.description}</Typography>
              <Typography variant="body2">• 주소: {storeData.address}</Typography>
              <Typography variant="body2">• 전화번호: {storeData.phone}</Typography>
              <Typography variant="body2">• 영업시간: {storeData.businessHours}</Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
      <Paper sx={{ p: UI_CONSTANTS.SPACING.LG }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" textAlign="center">
          🏪 새 매장 등록
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: UI_CONSTANTS.SPACING.LG }}>
          매장 정보를 입력하여 새로운 매장을 등록하세요
        </Typography>

        {/* 스테퍼 */}
        <Stepper activeStep={activeStep} sx={{ mb: UI_CONSTANTS.SPACING.LG }}>
          {STEPPER_STEPS.STORE_REGISTER.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: UI_CONSTANTS.SPACING.MD }}>
            {error}
          </Alert>
        )}

        {/* 스텝 내용 */}
        <Box sx={{ mb: UI_CONSTANTS.SPACING.LG }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* 네비게이션 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            이전
          </Button>

          <Box sx={{ display: 'flex', gap: UI_CONSTANTS.SPACING.SM }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/store-dashboard')}
            >
              취소
            </Button>

            {activeStep === STEPPER_STEPS.STORE_REGISTER.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
              >
                {isLoading ? '등록 중...' : '매장 등록'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                다음
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default StoreRegisterScreen; 