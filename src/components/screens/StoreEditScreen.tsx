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
import {
    MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreStore } from '../../stores/storeStore';
import { getCurrentLocation, geocodeAddress } from '../../utils/locationHelper';
import type { UpdateStoreData, Location } from '../../types/store';
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
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // 매장 정보 불러오기
    useEffect(() => {
        if (storeId) {
            fetchStore(storeId);
        }
    }, [storeId, fetchStore]);

    // 현재 매장 정보로 폼 초기화
    useEffect(() => {
        if (currentStore) {
            const updateData: UpdateStoreData = {
                name: currentStore.name,
                description: currentStore.description,
                address: currentStore.address,
                phone: currentStore.phone,
                businessHours: currentStore.businessHours,
            };

            if (currentStore.latitude !== undefined) {
                updateData.latitude = currentStore.latitude;
            }
            if (currentStore.longitude !== undefined) {
                updateData.longitude = currentStore.longitude;
            }

            setStoreData(updateData);
        }
    }, [currentStore]);

    // 주소를 좌표로 변환
    const handleGeocodeAddress = useCallback(async (address: string) => {
        if (!address.trim()) return;

        try {
            const location = await geocodeAddress(address);
            setStoreData(prev => ({
                ...prev,
                latitude: location.latitude,
                longitude: location.longitude,
            }));
        } catch (error) {
            console.warn('주소 변환 실패:', error);
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!storeId || !user) {
            return;
        }

        try {
            clearError();

            // 주소가 있으면 좌표로 변환
            if (storeData.address && !storeData.latitude && !storeData.longitude) {
                await handleGeocodeAddress(storeData.address);
            }

            await updateStore(storeId, storeData);
            navigate('/store-dashboard');
        } catch (error) {
            console.error('매장 수정 실패:', error);
        }
    }, [storeId, storeData, user, updateStore, clearError, navigate, handleGeocodeAddress]);

    // 현재 위치 가져오기
    const handleGetCurrentLocation = useCallback(async () => {
        try {
            setIsLocationLoading(true);
            setLocationError(null);

            const location = await getCurrentLocation();
            setCurrentLocation(location);

            // 현재 위치를 기반으로 주소 자동 설정 (테스트용)
            const testAddress = `서울특별시 강남구 테헤란로 123 (현재 위치 기반)`;
            setStoreData(prev => ({
                ...prev,
                address: testAddress,
                latitude: location.latitude,
                longitude: location.longitude,
            }));

        } catch (error: any) {
            setLocationError(error.message);
            console.warn('위치 가져오기 실패:', error);
        } finally {
            setIsLocationLoading(false);
        }
    }, []);

    const handleChange = useCallback((field: keyof UpdateStoreData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        setStoreData(prev => ({
            ...prev,
            [field]: value,
        }));

        // 주소가 변경되면 좌표 초기화
        if (field === 'address') {
            setStoreData(prev => {
                const { latitude, longitude, ...rest } = prev;
                return rest;
            });
        }
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
                        {/* 위치 정보 섹션 */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                📍 위치 정보
                            </Typography>

                            {/* 현재 위치 버튼 */}
                            <Button
                                variant="outlined"
                                startIcon={isLocationLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
                                onClick={handleGetCurrentLocation}
                                disabled={isLocationLoading}
                                sx={{ mb: 2 }}
                            >
                                {isLocationLoading ? '위치 확인 중...' : '현재 위치 사용'}
                            </Button>

                            {currentLocation && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    현재 위치: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                </Alert>
                            )}

                            {locationError && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    {locationError}
                                </Alert>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            label="매장 주소"
                            value={storeData.address}
                            onChange={handleChange('address')}
                            required
                            helperText="고객이 찾아올 수 있는 정확한 주소를 입력하세요"
                        />

                        {/* 좌표 정보 표시 */}
                        {(storeData.latitude && storeData.longitude) && (
                            <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1 }}>
                                <Typography variant="body2" color="primary.main" gutterBottom>
                                    📍 좌표 정보
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    위도: {storeData.latitude.toFixed(6)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    경도: {storeData.longitude.toFixed(6)}
                                </Typography>
                            </Box>
                        )}

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
                            {(storeData.latitude && storeData.longitude) && (
                                <Typography variant="body2">• 좌표: {storeData.latitude.toFixed(6)}, {storeData.longitude.toFixed(6)}</Typography>
                            )}
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