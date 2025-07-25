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
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import type { UpdateStoreData } from '../../types/store';
import { UI_CONSTANTS, STEPPER_STEPS } from '../../constants';


const StoreEditScreen: React.FC = () => {
    const navigate = useNavigate();
    const { storeId } = useParams<{ storeId: string }>();
    const { user } = useAuthStore();
    const {
        currentStore,
        fetchStore,
        updateStore,
        isLoading,
        error,
        clearError
    } = useStoreStore();

    const [activeStep, setActiveStep] = useState(0);
    const [storeData, setStoreData] = useState<UpdateStoreData>({
        name: '',
        description: '',
        address: '',
        phone: '',
        businessHours: '',
    });

    // 매장 정보 불러오기
    useEffect(() => {
        if (storeId) {
            fetchStore(storeId);
        }
    }, [storeId, fetchStore]);

    // 현재 매장 정보로 폼 초기화
    useEffect(() => {
        if (currentStore) {
            setStoreData({
                name: currentStore.name,
                description: currentStore.description,
                address: currentStore.address,
                phone: currentStore.phone,
                businessHours: currentStore.businessHours,
            });
        }
    }, [currentStore]);

    const handleSubmit = useCallback(async () => {
        if (!storeId || !user) {
            return;
        }

        try {
            clearError();
            await updateStore(storeId, storeData);
            navigate('/store-dashboard');
        } catch (error) {
            console.error('매장 수정 실패:', error);
        }
    }, [storeId, storeData, user, updateStore, clearError, navigate]);

    const handleChange = useCallback((field: keyof UpdateStoreData) => (
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
                            ✏️ 매장 정보 수정 완료!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: UI_CONSTANTS.SPACING.MD }}>
                            수정된 정보로 매장을 업데이트하시겠습니까?
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.50', p: UI_CONSTANTS.SPACING.MD, borderRadius: 2, textAlign: 'left' }}>
                            <Typography variant="subtitle2" gutterBottom>수정된 매장 정보</Typography>
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

    // 로딩 중이거나 매장 정보가 없을 때
    if (isLoading || !currentStore) {
        return (
            <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
            <Paper sx={{ p: UI_CONSTANTS.SPACING.LG }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary" textAlign="center">
                    ✏️ 매장 정보 수정
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: UI_CONSTANTS.SPACING.LG }}>
                    매장 정보를 수정하세요
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
                                {isLoading ? '수정 중...' : '매장 수정'}
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

export default StoreEditScreen; 