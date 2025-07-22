import React, { useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Restaurant,
  QrCode,
  History,
  Favorite,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import DashboardHeader from '../common/DashboardHeader';
import { UI_CONSTANTS, APP_CONFIG } from '../../constants';
import { optimizeWebViewTransition } from '../../utils/webviewHelper';

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();

  // WebView 렌더링 최적화
  useEffect(() => {
    optimizeWebViewTransition();
  }, []);

  // 메뉴 아이템들을 useMemo로 최적화
  const menuItems = useMemo(() => [
    {
      title: 'QR코드 스캔',
      description: '매장의 QR코드를 스캔하여 바로 주문하세요',
      icon: <QrCode sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: '매장 선택',
      description: '원하는 매장을 선택하여 메뉴를 확인하세요',
      icon: <Restaurant sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: '주문 내역',
      description: '이전 주문 내역을 확인하세요',
      icon: <History sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'secondary.main' }} />,
      color: 'secondary.main',
    },
    {
      title: '즐겨찾기',
      description: '자주 방문하는 매장을 즐겨찾기에 추가하세요',
      icon: <Favorite sx={{ fontSize: UI_CONSTANTS.ICON_SIZES.LARGE, color: 'error.main' }} />,
      color: 'error.main',
    },
  ], []);

  // 사용자 생성일을 useMemo로 최적화
  const userCreatedDate = useMemo(() => {
    return user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-';
  }, [user?.createdAt]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 헤더 */}
      <DashboardHeader
        title={`🍽️ ${APP_CONFIG.NAME}`}
        maxWidth="md"
      />

      {/* 메인 콘텐츠 */}
      <Container maxWidth="md" sx={{ py: UI_CONSTANTS.SPACING.LG }}>
        {/* 환영 메시지 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mb: UI_CONSTANTS.SPACING.LG, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            안녕하세요, {user?.name}님! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            오늘은 어떤 매장에서 주문하실 건가요?
          </Typography>
        </Paper>

        {/* 메뉴 그리드 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.TABLET, gap: UI_CONSTANTS.SPACING.MD }}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: UI_CONSTANTS.SPACING.MD }}>
                <Box sx={{ mb: UI_CONSTANTS.SPACING.SM }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* 빠른 액션 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mt: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            빠른 주문
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'flex', gap: UI_CONSTANTS.SPACING.SM, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<QrCode />}
              sx={{ flex: 1, minWidth: 200 }}
            >
              QR코드 스캔
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Restaurant />}
              sx={{ flex: 1, minWidth: 200 }}
            >
              매장 선택
            </Button>
          </Box>
        </Paper>

        {/* 사용자 정보 */}
        <Paper sx={{ p: UI_CONSTANTS.SPACING.LG, mt: UI_CONSTANTS.SPACING.LG }}>
          <Typography variant="h6" gutterBottom>
            내 정보
          </Typography>
          <Divider sx={{ mb: UI_CONSTANTS.SPACING.MD }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: UI_CONSTANTS.GRID_BREAKPOINTS.TABLET, gap: UI_CONSTANTS.SPACING.SM }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                이름
              </Typography>
              <Typography variant="body1">
                {user?.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                이메일
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
            {user?.phone && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  전화번호
                </Typography>
                <Typography variant="body1">
                  {user.phone}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">
                가입일
              </Typography>
              <Typography variant="body1">
                {userCreatedDate}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardScreen; 