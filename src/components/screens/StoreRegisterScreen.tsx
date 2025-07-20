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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Store, Business, Phone, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import type { CreateStoreData } from '../../types/store';

const steps = ['매장 기본 정보', '매장 상세 정보', '완료'];

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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      return;
    }

    try {
      clearError();
      const storeId = await createStore(storeData, user.id);
      console.log('매장 생성 완료:', storeId);
      navigate('/store-dashboard');
    } catch (error) {
      console.error('매장 생성 실패:', error);
    }
  };

  const handleChange = (field: keyof CreateStoreData) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStoreData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return storeData.name.trim() !== '' && storeData.description.trim() !== '';
      case 1:
        return storeData.address.trim() !== '' && storeData.phone.trim() !== '';
      default:
        return true;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="매장명"
              value={storeData.name}
              onChange={handleChange('name')}
              margin="normal"
              required
              InputProps={{
                startAdornment: <Store sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="매장 설명"
              value={storeData.description}
              onChange={handleChange('description')}
              margin="normal"
              required
              multiline
              rows={3}
              InputProps={{
                startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="매장 주소"
              value={storeData.address}
              onChange={handleChange('address')}
              margin="normal"
              required
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="전화번호"
              value={storeData.phone}
              onChange={handleChange('phone')}
              margin="normal"
              required
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="영업시간"
              value={storeData.businessHours}
              onChange={handleChange('businessHours')}
              margin="normal"
              placeholder="예: 평일 09:00-18:00, 주말 10:00-17:00"
              InputProps={{
                startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                            매장 정보 확인
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography><strong>매장명:</strong> {storeData.name}</Typography>
              <Typography><strong>설명:</strong> {storeData.description}</Typography>
              <Typography><strong>주소:</strong> {storeData.address}</Typography>
              <Typography><strong>전화번호:</strong> {storeData.phone}</Typography>
              <Typography><strong>영업시간:</strong> {storeData.businessHours}</Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" align="center">
                    매장 등록
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} align="center">
                    새로운 매장을 등록해보세요
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
                        이전
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : '매장 등록'}
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