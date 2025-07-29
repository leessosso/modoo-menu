// 개발 환경 전용 디버깅 도구

interface DebugAuth {
    simulateFlutterLocation: () => Promise<void>;
    removeFlutterLocation: () => Promise<void>;
}

declare global {
    interface Window {
        debugAuth: DebugAuth;
    }
}

// Flutter 위치 정보 시뮬레이션
const simulateFlutterLocation = async (): Promise<void> => {
    console.log('🔧 Flutter 위치 정보 시뮬레이션 중...');

    try {
        // Flutter JavaScript Bridge 시뮬레이션
        if (typeof window !== 'undefined') {
            (window as any).flutterLocationBridge = {
                getLocationPermission: async () => ({ granted: true }),
                getCurrentLocation: async () => ({
                    success: true,
                    latitude: 37.5665,
                    longitude: 126.9780,
                }),
            };

            console.log('✅ Flutter 위치 정보 시뮬레이션 완료!');
            console.log('📍 시뮬레이션 위치: 37.5665, 126.9780');
            console.log('🔄 페이지를 새로고침합니다...');

            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (error) {
        console.error('❌ Flutter 위치 정보 시뮬레이션 실패:', error);
    }
};

// Flutter 위치 정보 제거
const removeFlutterLocation = async (): Promise<void> => {
    console.log('🔧 Flutter 위치 정보 제거 중...');

    try {
        if (typeof window !== 'undefined' && (window as any).flutterLocationBridge) {
            delete (window as any).flutterLocationBridge;
            console.log('✅ Flutter 위치 정보 제거 완료!');
            console.log('🔄 페이지를 새로고침합니다...');

            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (error) {
        console.error('❌ Flutter 위치 정보 제거 실패:', error);
    }
};

// 개발자 도구 초기화
const initializeDevTools = (): void => {
    if (typeof window !== 'undefined') {
        window.debugAuth = {
            simulateFlutterLocation,
            removeFlutterLocation,
        };
    }
};

// 개발 환경에서만 실행
if (import.meta.env.DEV) {
    initializeDevTools();
}

export default initializeDevTools; 