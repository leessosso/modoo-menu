import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Avatar,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { Person, Save, ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { UI_CONSTANTS } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';
import { useNavigate } from 'react-router-dom';

const UserProfileScreen: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateUser({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim()
            });
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError('정보 업데이트에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        optimizeWebViewTransition(() => {
            navigate(-1);
        });
    };

    return (
        <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ mr: 2 }}
                >
                    뒤로가기
                </Button>
                <Typography variant="h4" component="h1">
                    프로필 설정
                </Typography>
            </Box>

            <Paper sx={{ p: 4 }}>
                {/* 프로필 헤더 */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    mb: 4,
                    py: 3,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 2
                }}>
                    <Avatar sx={{ 
                        width: 100, 
                        height: 100, 
                        mb: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }}>
                        <Person sx={{ fontSize: 50 }} />
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                        {user?.name}
                    </Typography>
                    <Chip 
                        label={user?.role === 'store_owner' ? '매장관리자' : '고객'} 
                        color="secondary" 
                        sx={{ color: 'white' }}
                    />
                </Box>

                {/* 알림 메시지 */}
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        프로필 정보가 성공적으로 업데이트되었습니다.
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* 폼 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        fullWidth
                        label="이름"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        label="이메일"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        type="email"
                        variant="outlined"
                        disabled
                        helperText="이메일은 변경할 수 없습니다."
                    />

                    <TextField
                        fullWidth
                        label="전화번호"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        variant="outlined"
                        placeholder="010-1234-5678"
                    />
                </Box>

                {/* 저장 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSave}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{ 
                            px: 4, 
                            py: 1.5,
                            minWidth: 200
                        }}
                    >
                        {loading ? '저장 중...' : '저장'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default UserProfileScreen; 